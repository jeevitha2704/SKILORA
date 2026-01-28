import { NextRequest, NextResponse } from 'next/server'

interface ResumeData {
  name: string
  contact: {
    email: string
    phone: string
    linkedin: string
    portfolio: string
  }
  summary: string
  skills: {
    technical: string[]
    soft: string[]
    tools: string[]
    domains: string[]
  }
  experience: Array<{
    title: string
    company: string
    duration: string
    responsibilities: string[]
    achievements: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    outcome: string
  }>
}

interface JobRequirements {
  title: string
  company: string
  type: string
  experience: string
  education: string
  requiredSkills: Array<{ name: string; priority: 'must-have' | 'good-to-have' }>
  responsibilities: string[]
  keywords: string[]
}

interface AnalysisResult {
  jobOverview: JobRequirements
  resumeData: ResumeData
  skillMatch: {
    overallScore: number
    matched: string[]
    partiallyMatched: string[]
    missing: string[]
  }
  experienceMatch: {
    verdict: 'overqualified' | 'ideal' | 'underqualified'
    yearsOfExperience: number
    requiredYears: number
    relevantRoles: string[]
  }
  educationMatch: {
    aligned: boolean
    feedback: string
  }
  projectEvaluation: {
    relevantCount: number
    totalCount: number
    feedback: string[]
  }
  atsScore: {
    score: number
    matchedKeywords: string[]
    missingKeywords: string[]
  }
  gapAnalysis: {
    missingSkills: string[]
    weakSections: string[]
    improvementAreas: string[]
    genericPhrases: string[]
  }
  recommendations: {
    skillsToLearn: Array<{ skill: string; priority: 'high' | 'medium' | 'low'; resources?: string[] }>
    resumeImprovements: string[]
    sectionFeedback: {
      summary: string
      skills: string
      experience: string
      projects: string
      education: string
    }
  }
  courseRecommendations: Array<{
    name: string
    provider: string
    duration: string
    relevance: 'critical' | 'important' | 'nice-to-have'
  }>
  relatedJobs: Array<{
    title: string
    description: string
    matchPercentage: number
  }>
  overallFit: {
    score: number
    verdict: 'strong' | 'partial' | 'weak'
    summary: string
  }
}

async function parseResume(resumeText: string): Promise<ResumeData> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return extractResumeUsingRegex(resumeText)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume parser. Extract all information from the resume and return STRICT JSON only.
Return this exact JSON structure:
{
  "name": "string",
  "contact": { "email": "string", "phone": "string", "linkedin": "string", "portfolio": "string" },
  "summary": "string",
  "skills": { "technical": [], "soft": [], "tools": [], "domains": [] },
  "experience": [{ "title": "string", "company": "string", "duration": "string", "responsibilities": [], "achievements": [] }],
  "education": [{ "degree": "string", "institution": "string", "year": "string", "gpa": "string" }],
  "certifications": [{ "name": "string", "issuer": "string", "year": "string" }],
  "projects": [{ "name": "string", "description": "string", "technologies": [], "outcome": "string" }]
}`
          },
          {
            role: 'user',
            content: `Parse this resume:\n\n${resumeText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) throw new Error('OpenAI API failed')
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return parsed
  } catch (error) {
    console.error('Resume parsing failed:', error)
    return extractResumeUsingRegex(resumeText)
  }
}

async function parseJobDescription(jdText: string): Promise<JobRequirements> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return extractJobUsingRegex(jdText)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert job description analyzer. Extract structured requirements and return STRICT JSON only.
Return this exact JSON structure:
{
  "title": "string",
  "company": "string",
  "type": "string (Full-time/Part-time/Contract/Internship)",
  "experience": "string (e.g., '3-5 years')",
  "education": "string",
  "requiredSkills": [{ "name": "string", "priority": "must-have" | "good-to-have" }],
  "responsibilities": ["string"],
  "keywords": ["string"]
}`
          },
          {
            role: 'user',
            content: `Analyze this job description:\n\n${jdText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) throw new Error('OpenAI API failed')
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return parsed
  } catch (error) {
    console.error('Job parsing failed:', error)
    return extractJobUsingRegex(jdText)
  }
}

async function generateAnalysis(resume: ResumeData, job: JobRequirements): Promise<Omit<AnalysisResult, 'jobOverview' | 'resumeData'>> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return generateBasicAnalysis(resume, job)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional recruiter analyzing resume-to-job fit. Provide detailed, actionable analysis.
Return STRICT JSON matching this structure exactly. Be specific and quantitative.`
          },
          {
            role: 'user',
            content: `Analyze this resume against the job requirements:
RESUME: ${JSON.stringify(resume)}
JOB: ${JSON.stringify(job)}

Return this JSON structure:
{
  "skillMatch": {
    "overallScore": number (0-100),
    "matched": [string],
    "partiallyMatched": [string],
    "missing": [string]
  },
  "experienceMatch": {
    "verdict": "overqualified" | "ideal" | "underqualified",
    "yearsOfExperience": number,
    "requiredYears": number,
    "relevantRoles": [string]
  },
  "educationMatch": {
    "aligned": boolean,
    "feedback": "string"
  },
  "projectEvaluation": {
    "relevantCount": number,
    "totalCount": number,
    "feedback": [string]
  },
  "atsScore": {
    "score": number (0-100),
    "matchedKeywords": [string],
    "missingKeywords": [string]
  },
  "gapAnalysis": {
    "missingSkills": [string],
    "weakSections": [string],
    "improvementAreas": [string],
    "genericPhrases": [string]
  },
  "recommendations": {
    "skillsToLearn": [{ "skill": "string", "priority": "high" | "medium" | "low", "resources": [string] }],
    "resumeImprovements": [string],
    "sectionFeedback": {
      "summary": "string",
      "skills": "string",
      "experience": "string",
      "projects": "string",
      "education": "string"
    }
  },
  "courseRecommendations": [{ "name": "string", "provider": "string", "duration": "string", "relevance": "critical" | "important" | "nice-to-have" }],
  "relatedJobs": [{ "title": "string", "description": "string", "matchPercentage": number }],
  "overallFit": {
    "score": number (0-100),
    "verdict": "strong" | "partial" | "weak",
    "summary": "string"
  }
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) throw new Error('OpenAI API failed')
    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Analysis generation failed:', error)
    return generateBasicAnalysis(resume, job)
  }
}

function extractResumeUsingRegex(text: string): ResumeData {
  // Basic regex-based extraction
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
  const phoneMatch = text.match(/(\+?1?\d{9,15})/i)
  
  return {
    name: 'Not extracted',
    contact: {
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      linkedin: '',
      portfolio: ''
    },
    summary: text.substring(0, 200),
    skills: { technical: [], soft: [], tools: [], domains: [] },
    experience: [],
    education: [],
    certifications: [],
    projects: []
  }
}

function extractJobUsingRegex(text: string): JobRequirements {
  const titleMatch = text.match(/(?:position|role|job title)[:\s]+(.+?)(?:\n|at)/i)
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i)
  
  return {
    title: titleMatch?.[1]?.trim() || 'Not specified',
    company: 'Not extracted',
    type: 'Full-time',
    experience: expMatch?.[1] ? `${expMatch[1]}+ years` : 'Not specified',
    education: 'Not specified',
    requiredSkills: [],
    responsibilities: [],
    keywords: []
  }
}

function generateBasicAnalysis(resume: ResumeData, job: JobRequirements): Omit<AnalysisResult, 'jobOverview' | 'resumeData'> {
  return {
    skillMatch: {
      overallScore: 50,
      matched: [],
      partiallyMatched: [],
      missing: []
    },
    experienceMatch: {
      verdict: 'ideal',
      yearsOfExperience: 0,
      requiredYears: 0,
      relevantRoles: []
    },
    educationMatch: {
      aligned: false,
      feedback: 'Unable to determine education alignment'
    },
    projectEvaluation: {
      relevantCount: 0,
      totalCount: resume.projects.length,
      feedback: []
    },
    atsScore: {
      score: 50,
      matchedKeywords: [],
      missingKeywords: []
    },
    gapAnalysis: {
      missingSkills: [],
      weakSections: [],
      improvementAreas: ['Enable full analysis by providing OpenAI API key'],
      genericPhrases: []
    },
    recommendations: {
      skillsToLearn: [],
      resumeImprovements: ['Resume parsing requires OpenAI API key for detailed analysis'],
      sectionFeedback: {
        summary: 'Unable to analyze',
        skills: 'Unable to analyze',
        experience: 'Unable to analyze',
        projects: 'Unable to analyze',
        education: 'Unable to analyze'
      }
    },
    courseRecommendations: [],
    relatedJobs: [],
    overallFit: {
      score: 50,
      verdict: 'partial',
      summary: 'Detailed analysis requires OpenAI API key configuration'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resume, jobDescription } = body

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Both resume and job description are required' },
        { status: 400 }
      )
    }

    // Parse resume and job description
    const [resumeData, jobData] = await Promise.all([
      parseResume(resume),
      parseJobDescription(jobDescription)
    ])

    // Generate comprehensive analysis
    const analysis = await generateAnalysis(resumeData, jobData)

    const result: AnalysisResult = {
      jobOverview: jobData,
      resumeData: resumeData,
      ...analysis
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Resume analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume and job description' },
      { status: 500 }
    )
  }
}
