import { NextResponse } from 'next/server'

interface ResumeCompareResponse {
  error?: string
  resume_match_summary?: {
    matched_skills: string[]
    partially_matched_skills: string[]
    missing_skills: string[]
  }
  resume_strengths?: string[]
  resume_weaknesses?: string[]
  overall_match_percentage?: number
  resume_alignment_note?: string
}

function toLowerSafe(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function skillMentioned(resumeLower: string, skillName: string): boolean {
  const trimmed = skillName.trim()
  if (!trimmed) return false

  const lower = trimmed.toLowerCase()
  
  // Exact word boundary match for short skills
  if (/^[a-z]{1,3}$/i.test(trimmed)) {
    return new RegExp(`\\b${escapeRegExp(lower)}\\b`, 'i').test(resumeLower)
  }

  // Check for exact phrase match
  if (resumeLower.includes(lower)) return true

  // Check for normalized match (handles spacing variations)
  const normalized = lower.replace(/\s+/g, ' ')
  if (resumeLower.includes(normalized)) return true

  // Check for flexible match (handles common variations)
  const flexible = new RegExp(escapeRegExp(normalized).replace(/\\\s+/g, '\\s+'), 'i')
  return flexible.test(resumeLower)
}

function skillPartiallyMentioned(resumeLower: string, skillName: string): boolean {
  const tokens = skillName
    .split(/[^a-zA-Z0-9#+.]+/g)
    .map((t) => t.trim())
    .filter(Boolean)

  if (tokens.length <= 1) return false

  const meaningful = tokens.filter((t) => t.length >= 3)
  if (meaningful.length === 0) return false

  return meaningful.some((t) => skillMentioned(resumeLower, t))
}

function buildFallbackComparison(jobAnalysis: any, resumeText: string): ResumeCompareResponse {
  const requiredSkills: Array<{ name?: string }> = Array.isArray(jobAnalysis?.requiredSkills)
    ? jobAnalysis.requiredSkills
    : Array.isArray(jobAnalysis?.required_skills)
      ? jobAnalysis.required_skills
      : []

  const skillNames = requiredSkills
    .map((s) => (typeof s?.name === 'string' ? s.name.trim() : ''))
    .filter(Boolean)

  const resumeLower = toLowerSafe(resumeText)

  const matched: string[] = []
  const partial: string[] = []
  const missing: string[] = []

  for (const name of skillNames) {
    if (skillMentioned(resumeLower, name)) matched.push(name)
    else if (skillPartiallyMentioned(resumeLower, name)) partial.push(name)
    else missing.push(name)
  }

  const total = skillNames.length
  const overall = total > 0 ? Math.round(((matched.length + partial.length * 0.5) / total) * 100) : 0

  const strengths: string[] = []
  if (matched.length > 0) strengths.push(`Matches ${matched.length} required skill(s).`)
  if (partial.length > 0) strengths.push(`Partially matches ${partial.length} required skill(s).`)

  const weaknesses: string[] = []
  if (missing.length > 0) weaknesses.push(`Missing ${missing.length} required skill(s).`)

  return {
    resume_match_summary: {
      matched_skills: matched,
      partially_matched_skills: partial,
      missing_skills: missing,
    },
    resume_strengths: strengths,
    resume_weaknesses: weaknesses,
    overall_match_percentage: overall,
    resume_alignment_note:
      'Smart keyword matching used. Results may vary from AI analysis.',
  }
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    }
    throw new Error('Invalid JSON from AI')
  }
}

export async function POST(request: Request) {
  try {
    const { job_analysis, resume_text } = await request.json()

    if (!job_analysis) {
      return NextResponse.json({ error: 'JOB DESCRIPTION ANALYSIS is required' }, { status: 400 })
    }

    if (!resume_text || typeof resume_text !== 'string' || !resume_text.trim()) {
      return NextResponse.json({ error: 'Resume content is required for comparison' }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ success: true, analysis: buildFallbackComparison(job_analysis, resume_text) })
    }

    const systemPrompt = `You are an AI Resume–Job Comparator for a career readiness platform called Skilora.
Your responsibility is to compare a candidate’s resume with a job description and identify alignment, gaps, and strengths.

Strict rules:
- Use only the information present in the inputs
- Do NOT infer experience or skills that are not explicitly mentioned
- Be neutral, factual, and concise
- Do NOT generate advice or learning plans
- Output must be structured and suitable for dashboards`

    const userPrompt = `Compare the candidate resume with the job description below and produce a structured comparison.

JOB DESCRIPTION ANALYSIS:
${JSON.stringify(job_analysis)}

RESUME CONTENT:
${resume_text}

COMPARISON INSTRUCTIONS (CRITICAL):
1. Identify skills explicitly mentioned in the resume
2. Match resume skills against required job skills
3. Classify each job-required skill as: Matched, Partially matched, Not mentioned
4. Identify strengths where the resume exceeds job requirements
5. Do NOT speculate beyond the resume content

If resume content is missing or unreadable, return:
{"error":"Resume content is required for comparison"}

OUTPUT FORMAT (STRICT JSON):
{
  "resume_match_summary": {
    "matched_skills": [],
    "partially_matched_skills": [],
    "missing_skills": []
  },
  "resume_strengths": [],
  "resume_weaknesses": [],
  "overall_match_percentage": 0,
  "resume_alignment_note": ""
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        max_tokens: 1400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = String(errorData?.error?.message || 'OpenAI request failed')
      return NextResponse.json({
        success: true,
        analysis: buildFallbackComparison(job_analysis, resume_text),
        error: msg,
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const parsed = safeJsonParse(text) as ResumeCompareResponse

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, analysis: parsed })
  } catch (error) {
    console.error('Error comparing resume:', error)
    return NextResponse.json({ error: 'Failed to compare resume with job description' }, { status: 500 })
  }
}
