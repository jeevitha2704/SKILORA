import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createJobAnalysis } from '@/lib/database'

interface JobAnalysis {
  title?: string
  company?: string
  requiredSkills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: 'technical' | 'tool' | 'soft' | 'domain'
    required: boolean
  }>
  experienceLevel: string
  educationRequirements: string
  salaryRange?: string
  responsibilities: string[]
  qualifications: string[]
  resumeMatch?: {
    overallMatch: number
    skillsGap: number
    technicalMatch: number
    experienceMatch: number
    educationMatch: number
    missingSkills: string[]
    matchedSkills: string[]
  }
}

async function callAIForAnalysis(jobDescription: string): Promise<JobAnalysis> {
  try {
    // Use OpenAI API for real AI analysis
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, falling back to enhanced pattern matching')
      return await enhancedPatternMatching(jobDescription)
    }

    const prompt = `
You are an AI Job Description Analyzer.
Your task is to analyze a job description and extract clear, structured job requirements.

Extraction rules:
- Extract ONLY what is explicitly mentioned in the job description
- Do NOT guess or add missing information
- If a detail is not mentioned, use the exact string "Not specified"
- Return STRICT JSON only (no markdown, no prose)

JOB DESCRIPTION:
${jobDescription}

If the job description is empty or too short to analyze, return:
{"error":"Insufficient job description provided for analysis"}

Return this STRICT JSON format:
{
  "jobTitle": "Not specified",
  "company": "Not specified",
  "experienceLevel": "Not specified",
  "educationRequirements": "Not specified",
  "salaryRange": "Not specified",
  "requiredSkills": [],
  "responsibilities": [],
  "qualifications": []
}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You extract structured job requirements from job descriptions. Respond with STRICT JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      throw new Error(errorData.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content
    
    const analysis = JSON.parse(analysisText)
    
    if (analysis.error) {
      throw new Error(analysis.error)
    }

    const requiredSkills = Array.isArray(analysis.requiredSkills)
      ? analysis.requiredSkills
          .filter(
            (s: any) =>
              s &&
              typeof s.name === 'string' &&
              s.name.trim() &&
              s.name.trim().toLowerCase() !== 'not specified'
          )
          .map((s: any) => ({
            name: String(s.name).trim(),
            level: (s.level || 'intermediate') as any,
            category: (s.category === 'tools' ? 'tool' : s.category) as any,
            required: Boolean(s.required),
          }))
      : []

    return {
      title: typeof analysis.jobTitle === 'string' && analysis.jobTitle.trim() ? analysis.jobTitle.trim() : 'Not specified',
      company: typeof analysis.company === 'string' && analysis.company.trim() ? analysis.company.trim() : 'Not specified',
      requiredSkills,
      experienceLevel:
        typeof analysis.experienceLevel === 'string' && analysis.experienceLevel.trim()
          ? analysis.experienceLevel.trim()
          : 'Not specified',
      educationRequirements:
        typeof analysis.educationRequirements === 'string' && analysis.educationRequirements.trim()
          ? analysis.educationRequirements.trim()
          : 'Not specified',
      salaryRange:
        typeof analysis.salaryRange === 'string' && analysis.salaryRange.trim()
          ? analysis.salaryRange.trim()
          : 'Not specified',
      responsibilities: Array.isArray(analysis.responsibilities) ? analysis.responsibilities : [],
      qualifications: Array.isArray(analysis.qualifications) ? analysis.qualifications : [],
      resumeMatch: undefined,
    }

  } catch (error) {
    console.error('AI analysis failed, falling back to pattern matching:', error)
    return await enhancedPatternMatching(jobDescription)
  }
}

async function enhancedPatternMatching(jobDescription: string): Promise<JobAnalysis> {
  // Enhanced pattern matching for when AI is not available
  const text = jobDescription.toLowerCase()
  
  // Extract job title with more specific patterns
  const titlePatterns = [
    /senior?\s+(.+)\s+(developer|engineer|manager|analyst|designer|architect|consultant)/i,
    /(.+)\s+(developer|engineer|manager|analyst|designer|architect|consultant)/i,
    /lead\s+(.+)/i,
    /principal\s+(.+)/i,
    /staff\s+(.+)/i
  ]
  
  let jobTitle = 'Not specified'
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match) {
      jobTitle = match[0].split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      break
    }
  }

  // Extract company with better patterns
  const companyPatterns = [
    /(?:at|for|join)\s+([A-Z][a-zA-Z\s&]+?)(?:\n|\.|,|$)/i,
    /(?:company|organization):\s*([A-Z][a-zA-Z\s&]+?)(?:\n|\.|,|$)/i
  ]
  const companyMatch = companyPatterns.find(pattern => pattern.test(jobDescription))
  const company = companyMatch ? companyMatch.exec(jobDescription)?.[1]?.trim() : 'Not specified'

  // More comprehensive skill extraction
  const skillDatabase: {
    technical: Array<{ name: string; patterns: RegExp[]; level: string }>
    soft: Array<{ name: string; patterns: RegExp[]; level: string }>
    tool: Array<{ name: string; patterns: RegExp[]; level: string }>
    domain: Array<{ name: string; patterns: RegExp[]; level: string }>
  } = {
    technical: [
      { name: 'JavaScript', patterns: [/javascript/i, /js/i, /ecmascript/i], level: 'advanced' },
      { name: 'TypeScript', patterns: [/typescript/i, /ts/i], level: 'intermediate' },
      { name: 'React', patterns: [/react/i, /reactjs/i, /react\.js/i], level: 'advanced' },
      { name: 'Vue.js', patterns: [/vue/i, /vuejs/i], level: 'intermediate' },
      { name: 'Angular', patterns: [/angular/i, /angularjs/i], level: 'intermediate' },
      { name: 'Node.js', patterns: [/node\.?js/i, /nodejs/i, /node\.js/i], level: 'intermediate' },
      { name: 'Python', patterns: [/\bpython\b/i], level: 'intermediate' },
      { name: 'Java', patterns: [/\bjava\b/i], level: 'intermediate' },
      { name: 'C#', patterns: [/c\#/i, /csharp/i], level: 'intermediate' },
      { name: 'Go', patterns: [/\bgo\b/i, /golang/i], level: 'intermediate' },
      { name: 'Rust', patterns: [/rust/i], level: 'intermediate' },
      { name: 'SQL', patterns: [/sql/i, /mysql/i, /postgresql/i, /mongodb/i], level: 'intermediate' },
      { name: 'NoSQL', patterns: [/nosql/i, /mongodb/i, /cassandra/i], level: 'intermediate' },
      { name: 'AWS', patterns: [/aws/i, /amazon web services/i, /ec2/i, /s3/i], level: 'intermediate' },
      { name: 'Azure', patterns: [/azure/i, /microsoft azure/i], level: 'intermediate' },
      { name: 'GCP', patterns: [/gcp/i, /google cloud/i], level: 'intermediate' },
      { name: 'Docker', patterns: [/docker/i, /container/i], level: 'intermediate' },
      { name: 'Kubernetes', patterns: [/kubernetes/i, /k8s/i], level: 'intermediate' },
      { name: 'Git', patterns: [/git/i, /github/i, /gitlab/i], level: 'advanced' },
      { name: 'REST API', patterns: [/rest/i, /restful/i, /api/i], level: 'advanced' },
      { name: 'GraphQL', patterns: [/graphql/i], level: 'intermediate' },
      { name: 'HTML/CSS', patterns: [/html/i, /css/i, /sass/i, /scss/i], level: 'advanced' },
      { name: 'Machine Learning', patterns: [/machine learning/i, /ml/i, /ai/i], level: 'expert' },
      { name: 'Data Science', patterns: [/data science/i, /analytics/i], level: 'expert' }
    ],
    soft: [
      { name: 'Communication', patterns: [/communication/i, /communicate/i, /presentation/i], level: 'expert' },
      { name: 'Problem Solving', patterns: [/problem.?solving/i, /analytical/i, /critical thinking/i], level: 'expert' },
      { name: 'Teamwork', patterns: [/teamwork/i, /collaborat/i, /team player/i], level: 'expert' },
      { name: 'Leadership', patterns: [/leadership/i, /lead/i, /manage/i, /mentor/i], level: 'advanced' },
      { name: 'Project Management', patterns: [/project.?management/i, /pm/i, /agile/i, /scrum/i], level: 'advanced' },
      { name: 'Time Management', patterns: [/time.?management/i, /deadline/i, /priorit/i], level: 'intermediate' },
      { name: 'Adaptability', patterns: [/adaptability/i, /flexible/i, /learn quickly/i], level: 'intermediate' }
    ],
    tool: [
      { name: 'Microsoft Office', patterns: [/office/i, /excel/i, /word/i, /powerpoint/i], level: 'intermediate' },
      { name: 'JIRA', patterns: [/jira/i], level: 'intermediate' },
      { name: 'Slack', patterns: [/slack/i], level: 'beginner' },
      { name: 'Figma', patterns: [/figma/i], level: 'intermediate' },
      { name: 'VS Code', patterns: [/vs.?code/i, /visual studio/i], level: 'intermediate' },
      { name: 'CI/CD', patterns: [/ci\/cd/i, /continuous integration/i, /jenkins/i, /github actions/i], level: 'intermediate' }
    ],
    domain: [
      { name: 'E-commerce', patterns: [/ecommerce/i, /e-commerce/i], level: 'intermediate' },
      { name: 'Finance', patterns: [/finance/i, /fintech/i, /banking/i], level: 'intermediate' },
      { name: 'Healthcare', patterns: [/healthcare/i, /medical/i], level: 'intermediate' },
      { name: 'Education', patterns: [/education/i, /edtech/i], level: 'intermediate' }
    ]
  }

  const requiredSkills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: 'technical' | 'tool' | 'soft' | 'domain'
    required: boolean
    patterns?: RegExp[]
  }> = []
  
  Object.entries(skillDatabase).forEach(([category, skills]) => {
    skills.forEach(skill => {
      const found = skill.patterns.some(pattern => pattern.test(text))
      if (found) {
        requiredSkills.push({
          name: skill.name,
          level: skill.level as any,
          category: category as 'technical' | 'tool' | 'soft' | 'domain',
          required: true
        })
      }
    })
  })

  // Enhanced experience extraction
  const experiencePatterns = [
    { pattern: /(\d+)\+?\s*(?:years?|yrs?)/i, extract: (m: RegExpMatchArray) => `${m[1]}+ years` },
    { pattern: /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i, extract: (m: RegExpMatchArray) => `${m[1]}-${m[2]} years` },
    { pattern: /entry.?level|junior|0-2/i, extract: () => '0-2 years' },
    { pattern: /mid.?level|intermediate|3-5/i, extract: () => '3-5 years' },
    { pattern: /senior|sr\.|5\+|lead/i, extract: () => '5+ years' },
    { pattern: /principal|staff|8\+|architect/i, extract: () => '8+ years' }
  ]
  
  let experienceLevel = 'Not specified'
  for (const { pattern, extract } of experiencePatterns) {
    const match = text.match(pattern)
    if (match) {
      experienceLevel = extract(match)
      break
    }
  }

  // Enhanced education extraction
  const educationPatterns = [
    { pattern: /bachelor'?s? degree|bs|b\.s/i, extract: () => "Bachelor's degree" },
    { pattern: /master'?s? degree|ms|m\.s/i, extract: () => "Master's degree" },
    { pattern: /phd|doctorate/i, extract: () => "PhD or Doctorate" },
    { pattern: /degree in ([^.]+)/i, extract: (m: RegExpMatchArray) => `Degree in ${m[1].trim()}` },
    { pattern: /high school|diploma/i, extract: () => "High school diploma" }
  ]
  
  let educationRequirements = 'Not specified'
  for (const { pattern, extract } of educationPatterns) {
    const match = text.match(pattern)
    if (match) {
      educationRequirements = extract(match)
      break
    }
  }

  return {
    title: jobTitle,
    company,
    requiredSkills,
    experienceLevel,
    educationRequirements,
    responsibilities: [],
    qualifications: [],
    resumeMatch: undefined
  }
}

export async function POST(request: Request) {
  try {
    const { jobDescription, userId } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Analyze the job description with AI
    const analysis = await callAIForAnalysis(jobDescription)

    // Save analysis to database if userId is provided
    if (userId) {
      try {
        const parsed_skills = analysis.requiredSkills.map((skill: any) => ({
          name: skill.name,
          level: skill.level,
          category: skill.category === 'tools' ? 'tool' : skill.category,
          required: skill.required
        }))

        const payload = {
          title: analysis.title || 'Position',
          company: analysis.company || 'Company',
          experience: analysis.experienceLevel || 'Not specified',
          education: analysis.educationRequirements || 'Not specified',
          raw_text: jobDescription,
          parsed_skills
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (supabaseUrl && serviceRoleKey) {
          const admin = createClient(supabaseUrl, serviceRoleKey)
          const { error: insertError } = await admin
            .from('job_analyses')
            .insert({ user_id: userId, ...payload })

          if (insertError) throw insertError
        } else {
          // No service role configured. Skip server-side insert (client-side save will handle it with session).
          console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; skipping server-side job_analyses insert')
        }
      } catch (error) {
        console.error('Error saving job analysis:', error)
        // Continue even if save fails
      }
    } else {
      console.log('No userId provided, skipping database save')
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Error analyzing job:', error)
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    )
  }
}
