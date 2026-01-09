import { NextResponse } from 'next/server'

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

type SkillCategory = 'technical' | 'tool' | 'soft' | 'domain'

interface JobRequirementSkill {
  name: string
  level?: SkillLevel
  category?: SkillCategory
  required?: boolean
}

interface UserSkill {
  name: string
  level?: SkillLevel | number
  category?: SkillCategory
}

interface SkillGapAIResponse {
  error?: string
  skill_gap_summary?: {
    strong_matches: string[]
    partial_matches: string[]
    missing_skills: string[]
  }
  priority_classification?: {
    high_priority: string[]
    medium_priority: string[]
    low_priority: string[]
  }
  job_readiness_estimate?: number
  gap_insights?: string[]
  next_best_skill?: {
    skill: string
    reason: string
    estimated_effort: string
  }
  fallbackNote?: string
}

function normalizeSkillName(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function toSkillLevelNumber(level: unknown): number {
  if (typeof level === 'number') return level
  if (typeof level !== 'string') return 0
  switch (level) {
    case 'beginner':
      return 1
    case 'intermediate':
      return 2
    case 'advanced':
      return 3
    case 'expert':
      return 4
    default:
      return 0
  }
}

function skillTokenOverlap(a: string, b: string): boolean {
  const aTokens = a.split(/[^a-zA-Z0-9#+.]+/g).filter((t) => t.length >= 3)
  const bTokens = b.split(/[^a-zA-Z0-9#+.]+/g).filter((t) => t.length >= 3)
  if (aTokens.length === 0 || bTokens.length === 0) return false
  
  // Check for significant token overlap (at least 50% of tokens)
  const overlap = aTokens.filter((t) => bTokens.includes(t)).length
  const threshold = Math.max(1, Math.floor(bTokens.length * 0.5))
  return overlap >= threshold
}

function buildFallbackSkillGap(jobRequirements: any, userSkills: any[]): SkillGapAIResponse {
  const required: JobRequirementSkill[] = Array.isArray(jobRequirements?.required_skills)
    ? jobRequirements.required_skills
    : Array.isArray(jobRequirements?.requiredSkills)
      ? jobRequirements.requiredSkills
      : []

  const users: UserSkill[] = Array.isArray(userSkills) ? userSkills : []

  const userByName = new Map<string, UserSkill>()
  for (const us of users) {
    const key = normalizeSkillName(us?.name)
    if (key && !userByName.has(key)) userByName.set(key, us)
  }

  const strong: string[] = []
  const partial: string[] = []
  const missing: string[] = []

  for (const req of required) {
    const reqName = typeof req?.name === 'string' ? req.name.trim() : ''
    const reqKey = normalizeSkillName(req?.name)
    if (!reqName || !reqKey) continue

    const exact = userByName.get(reqKey)
    if (exact) {
      const userLvl = toSkillLevelNumber(exact.level)
      const reqLvl = toSkillLevelNumber(req.level)
      if (reqLvl > 0 && userLvl > 0 && userLvl >= reqLvl) strong.push(reqName)
      else partial.push(reqName)
      continue
    }

    // Partial match: token overlap (e.g. "REST API" vs "APIs")
    const foundPartial = users.some((u) => {
      const uKey = normalizeSkillName(u?.name)
      return uKey ? skillTokenOverlap(uKey, reqKey) : false
    })
    if (foundPartial) partial.push(reqName)
    else missing.push(reqName)
  }

  const total = strong.length + partial.length + missing.length
  const readiness = total > 0 ? Math.round(((strong.length + partial.length * 0.5) / total) * 100) : 0

  const high = [...missing]
  const medium = [...partial]
  const low = [...strong]

  const insights: string[] = []
  if (missing.length > 0) insights.push('Some required skills are missing from your profile.')
  if (partial.length > 0) insights.push('Some required skills are partially matched based on your current level or keywords.')

  const nextBest = missing[0]

  return {
    skill_gap_summary: {
      strong_matches: strong,
      partial_matches: partial,
      missing_skills: missing,
    },
    priority_classification: {
      high_priority: high,
      medium_priority: medium,
      low_priority: low,
    },
    job_readiness_estimate: readiness,
    gap_insights: insights,
    ...(nextBest
      ? {
          next_best_skill: {
            skill: nextBest,
            reason: 'Selected as first missing required skill in job requirements.',
            estimated_effort: 'Varies',
          },
        }
      : {}),
    fallbackNote: 'Smart skill matching used. Results may vary from AI analysis.',
  }
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = text.slice(firstBrace, lastBrace + 1)
      return JSON.parse(sliced)
    }
    throw new Error('Invalid JSON from AI')
  }
}

export async function POST(request: Request) {
  try {
    const { job_requirements, user_skills, experience_level } = await request.json()

    if (!job_requirements) {
      return NextResponse.json({ error: 'JOB REQUIREMENTS is required' }, { status: 400 })
    }

    if (!Array.isArray(user_skills) || user_skills.length === 0) {
      return NextResponse.json(
        { error: 'User skill profile is required for skill-gap analysis' },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ success: true, analysis: buildFallbackSkillGap(job_requirements, user_skills) })
    }

    const systemPrompt = `You are an AI Skill-Gap Analyst for a career readiness platform called Skilora.
Your job is to compare job requirements with a user’s skills and identify gaps clearly and realistically.

Follow these rules strictly:
- Never assume skills the user does not explicitly have
- Never invent proficiency levels
- Prioritize skills based on job relevance
- Be practical, not aspirational
- Output must be structured and UI-ready`

    const userPrompt = `Perform a skill-gap analysis using the information below.

JOB REQUIREMENTS:
${JSON.stringify(job_requirements)}

USER SKILLS PROFILE:
${JSON.stringify(user_skills)}

USER EXPERIENCE LEVEL (optional):
${experience_level ?? 'Not specified'}

ANALYSIS INSTRUCTIONS (CRITICAL):
1. Match user skills against required job skills
2. Classify each required skill as: Strong match, Partial match, Missing
3. Assign priority based on job importance
4. Estimate readiness impact of missing skills
5. Do NOT explain reasoning in text form

If user skills data is empty or invalid, return:
{"error":"User skill profile is required for skill-gap analysis"}

OUTPUT FORMAT (STRICT JSON):
{
  "skill_gap_summary": {
    "strong_matches": [],
    "partial_matches": [],
    "missing_skills": []
  },
  "priority_classification": {
    "high_priority": [],
    "medium_priority": [],
    "low_priority": []
  },
  "job_readiness_estimate": 0,
  "gap_insights": []
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
        max_tokens: 1200,
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
        analysis: buildFallbackSkillGap(job_requirements, user_skills),
        error: msg,
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const parsed = safeJsonParse(text) as SkillGapAIResponse

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, analysis: parsed })
  } catch (error) {
    console.error('Error analyzing skill gap:', error)
    return NextResponse.json({ error: 'Failed to analyze skill gap' }, { status: 500 })
  }
}
