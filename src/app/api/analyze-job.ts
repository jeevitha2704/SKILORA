import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createJobAnalysis } from '@/lib/database'

interface JobAnalysis {
  title?: string
  company?: string
  requiredSkills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: 'technical' | 'tools' | 'soft' | 'domain'
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

async function callAIForAnalysis(jobDescription: string, resume?: string): Promise<JobAnalysis> {
  try {
    // Use OpenAI API for real AI analysis
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, falling back to enhanced pattern matching')
      return await enhancedPatternMatching(jobDescription, resume)
    }

    const prompt = `
You are an expert HR analyst and career counselor with deep knowledge of current job market trends and requirements. Analyze the following job description and resume to provide highly accurate and personalized analysis.

JOB DESCRIPTION:
${jobDescription}

${resume ? `\nRESUME:\n${resume}` : ''}

CRITICAL INSTRUCTIONS:
1. Be extremely specific and detailed in your analysis
2. Extract ACTUAL skills mentioned, not generic ones
3. For resume analysis, identify EXACT skills the candidate has vs what's needed
4. Provide realistic match percentages based on actual skill overlap
5. Consider experience levels, education, and specific technologies mentioned
6. Focus on CURRENT market requirements and trends
7. Do NOT provide generic or fake information

Please provide a detailed analysis in the following JSON format:
{
  "jobTitle": "Extracted exact job title from description",
  "company": "Company type (e.g., 'Tech Company', 'Startup', 'Enterprise')",
  "requiredSkills": [
    {
      "name": "EXACT skill name mentioned in job description",
      "level": "beginner|intermediate|advanced|expert based on job requirements",
      "category": "technical|soft|tools|domain",
      "required": true/false based on whether it's essential or preferred
    }
  ],
  "experienceLevel": "Exact experience requirement from description",
  "educationRequirements": "Exact education requirements from description",
  "responsibilities": ["Extract actual responsibilities from job description"],
  "qualifications": ["Extract actual qualifications from job description"],
  ${resume ? `
  "resumeMatch": {
    "overallMatch": "Calculate based on actual skill overlap (0-100)",
    "skillsGap": "Count of required skills NOT found in resume",
    "technicalMatch": "Percentage of technical skills candidate actually has",
    "experienceMatch": "Match based on years of experience in resume vs requirements", 
    "educationMatch": "Match based on education in resume vs requirements",
    "missingSkills": ["List of required skills NOT found in resume"],
    "matchedSkills": ["List of required skills FOUND in resume"]
  }
  ` : ''}
}

ANALYSIS REQUIREMENTS:
- Extract ONLY skills explicitly mentioned in the job description
- For resume matching, identify exact skills present vs missing
- Be realistic about experience and education requirements
- Provide accurate percentages based on actual content analysis
- Consider seniority level and industry standards
- Focus on what employers are actually looking for in 2024-2025
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst providing accurate job analysis based on real job market data. Always respond with valid JSON.'
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
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText)
    
    // Validate and format the response
    return {
      title: analysis.jobTitle || 'Position',
      company: analysis.company || 'Company',
      requiredSkills: analysis.requiredSkills || [],
      experienceLevel: analysis.experienceLevel || 'Not specified',
      educationRequirements: analysis.educationRequirements || 'Not specified',
      responsibilities: analysis.responsibilities || [],
      qualifications: analysis.qualifications || [],
      resumeMatch: analysis.resumeMatch
    }

  } catch (error) {
    console.error('AI analysis failed, falling back to pattern matching:', error)
    return await enhancedPatternMatching(jobDescription, resume)
  }
}

async function enhancedPatternMatching(jobDescription: string, resume?: string): Promise<JobAnalysis> {
  const text = jobDescription.toLowerCase()
  
  // Extract job title with more specific patterns
  const titlePatterns = [
    /senior?\s+(.+)\s+(developer|engineer|manager|analyst|designer|architect|consultant)/i,
    /(.+)\s+(developer|engineer|manager|analyst|designer|architect|consultant)/i,
    /lead\s+(.+)/i,
    /principal\s+(.+)/i,
    /staff\s+(.+)/i
  ]
  
  let jobTitle = 'Position'
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
  const company = companyMatch ? companyMatch.exec(jobDescription)?.[1]?.trim() : 'Company'

  // More comprehensive skill extraction
  const skillDatabase = {
    technical: [
      { name: 'JavaScript', patterns: [/javascript/i, /js/i, /ecmascript/i], level: 'advanced' },
      { name: 'TypeScript', patterns: [/typescript/i, /ts/i], level: 'intermediate' },
      { name: 'React', patterns: [/react/i, /reactjs/i, /react\.js/i], level: 'advanced' },
      { name: 'Vue.js', patterns: [/vue/i, /vuejs/i], level: 'intermediate' },
      { name: 'Angular', patterns: [/angular/i, /angularjs/i], level: 'intermediate' },
      { name: 'Node.js', patterns: [/node\.?js/i, /nodejs/i], level: 'intermediate' },
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
    tools: [
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
    category: 'technical' | 'soft' | 'domain' | 'tools'
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
          category: category as 'technical' | 'soft' | 'domain' | 'tools',
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

  // Enhanced resume matching logic
  let resumeMatch
  if (resume) {
    const resumeText = resume.toLowerCase()
    
    const matchedSkills = requiredSkills.filter(skill => 
      skill.patterns?.some((pattern: RegExp) => pattern.test(resumeText))
    ).map(skill => skill.name)
    
    const missingSkills = requiredSkills
      .filter(skill => !matchedSkills.includes(skill.name))
      .map(skill => skill.name)

    // Calculate more accurate match percentages
    const totalRequiredSkills = requiredSkills.length
    const matchedCount = matchedSkills.length
    const overallMatch = totalRequiredSkills > 0 ? Math.round((matchedCount / totalRequiredSkills) * 100) : 0
    
    const technicalSkills = requiredSkills.filter(s => s.category === 'technical')
    const matchedTechnical = technicalSkills.filter(skill => 
      skill.patterns?.some((pattern: RegExp) => pattern.test(resumeText))
    ).length
    const technicalMatch = technicalSkills.length > 0 ? Math.round((matchedTechnical / technicalSkills.length) * 100) : 0

    // Extract experience from resume for better matching
    const resumeExperiencePatterns = [
      /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i,
      /experience:\s*(\d+)/i
    ]
    let resumeYears = 0
    for (const pattern of resumeExperiencePatterns) {
      const match = resumeText.match(pattern)
      if (match) {
        resumeYears = parseInt(match[1])
        break
      }
    }

    // Extract education from resume
    const resumeEducationPatterns = [
      /bachelor'?s?|bs|b\.s/i,
      /master'?s?|ms|m\.s/i,
      /phd|doctorate/i
    ]
    let hasDegree = false
    for (const pattern of resumeEducationPatterns) {
      if (pattern.test(resumeText)) {
        hasDegree = true
        break
      }
    }

    // Calculate experience and education matches
    const requiredYears = parseInt(experienceLevel) || 0
    const experienceMatch = requiredYears > 0 ? Math.min(100, Math.round((resumeYears / requiredYears) * 100)) : 100
    const educationMatch = hasDegree ? 100 : 50

    resumeMatch = {
      overallMatch,
      skillsGap: missingSkills.length,
      technicalMatch,
      experienceMatch,
      educationMatch,
      missingSkills,
      matchedSkills
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
    resumeMatch
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resume, userId } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Analyze the job description with AI
    const analysis = await callAIForAnalysis(jobDescription, resume)

    // Save analysis to database if userId is provided
    if (userId) {
      try {
        await createJobAnalysis(userId, {
          title: analysis.title || 'Position',
          company: analysis.company || 'Company',
          experience: analysis.experienceLevel || 'Not specified',
          education: analysis.educationRequirements || 'Not specified',
          raw_text: jobDescription,
          parsed_skills: analysis.requiredSkills
        })
      } catch (error) {
        console.error('Error saving job analysis:', error)
        // Continue even if save fails
      }
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
