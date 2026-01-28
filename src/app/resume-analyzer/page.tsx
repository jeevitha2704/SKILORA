'use client'

import { useRef, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Microscope,
  Target,
  TrendingUp,
  Upload,
  X,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'

interface AnalysisResult {
  jobOverview: {
    title: string
    company: string
    type: string
    experience: string
    education: string
    requiredSkills: Array<{ name: string; priority: string }>
    responsibilities: string[]
    keywords: string[]
  }
  resumeData: {
    name: string
    contact: any
    summary: string
    skills: {
      technical: string[]
      soft: string[]
      tools: string[]
      domains: string[]
    }
    experience: Array<any>
    education: Array<any>
    certifications: Array<any>
    projects: Array<any>
  }
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
    skillsToLearn: Array<{ skill: string; priority: string; resources?: string[] }>
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
    relevance: string
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

export default function ResumeAnalyzer() {
  const { user } = useAuth()
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)

  const handleResumeUpload = async (file: File) => {
    const isTxt = file.name.toLowerCase().endsWith('.txt')
    const isPdf = file.name.toLowerCase().endsWith('.pdf')

    if (!isTxt && !isPdf) {
      setError('Please upload a TXT or PDF resume file.')
      return
    }

    try {
      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer()
        const text = await extractTextFromPDF(arrayBuffer)
        setResume(text)
        setResumeFileName(file.name)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          const text = typeof reader.result === 'string' ? reader.result : ''
          setResume(text)
          setResumeFileName(file.name)
        }
        reader.onerror = () => setError('Failed to read resume file')
        reader.readAsText(file)
      }
    } catch (err) {
      setError('Failed to process resume file. Please try a text file instead.')
    }
  }

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      if (typeof window === 'undefined') return 'PDF processing only available in browser'

      if (!window.pdfjsLib) await loadPDFJS()

      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      let fullText = ''
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n'
      }

      return fullText.replace(/\s+/g, ' ').trim()
    } catch (error) {
      console.error('PDF extraction error:', error)
      return 'PDF extraction failed. Please upload a text file.'
    }
  }

  const loadPDFJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve()
        } else {
          reject(new Error('Failed to load PDF.js'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load PDF.js script'))
      document.head.appendChild(script)
    })
  }

  const removeResume = () => {
    setResume('')
    setResumeFileName(null)
    if (resumeFileInputRef.current) resumeFileInputRef.current.value = ''
  }

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resume.trim(),
          jobDescription: jobDescription.trim(),
        }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError('Failed to analyze. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'strong':
        return 'text-green-400'
      case 'partial':
        return 'text-yellow-400'
      case 'weak':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const generatePDFReport = () => {
    if (!analysis) return

    // Create a detailed HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Professional Resume Analysis Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            opacity: 0.9;
          }
          .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .section h2 {
            color: #667eea;
            font-size: 20px;
            margin-top: 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }
          .section h3 {
            color: #764ba2;
            font-size: 16px;
            margin-top: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 15px 0;
          }
          .stat-card {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
          }
          .skill-badge {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
          }
          .skill-badge.matched {
            background-color: #10b981;
          }
          .skill-badge.partial {
            background-color: #f59e0b;
          }
          .skill-badge.missing {
            background-color: #ef4444;
          }
          .feedback {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
          }
          .recommendation {
            background-color: #dbeafe;
            padding: 12px;
            border-radius: 6px;
            margin: 8px 0;
            border-left: 4px solid #3b82f6;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .table th {
            background-color: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
          }
          .table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
          }
          .table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .verdict {
            font-size: 16px;
            font-weight: bold;
            padding: 10px;
            border-radius: 6px;
            display: inline-block;
            margin: 10px 0;
          }
          .verdict.strong {
            background-color: #dcfce7;
            color: #166534;
          }
          .verdict.partial {
            background-color: #fef3c7;
            color: #92400e;
          }
          .verdict.weak {
            background-color: #fee2e2;
            color: #991b1b;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Professional Resume Analysis Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Job Overview Section -->
        <div class="section">
          <h2>Job Position Overview</h2>
          <h3>${analysis.jobOverview.title}</h3>
          <p><strong>Company:</strong> ${analysis.jobOverview.company}</p>
          <p><strong>Type:</strong> ${analysis.jobOverview.type}</p>
          <p><strong>Experience Required:</strong> ${analysis.jobOverview.experience}</p>
          <p><strong>Education Required:</strong> ${analysis.jobOverview.education}</p>
          <h3>Key Responsibilities</h3>
          <ul>
            ${analysis.jobOverview.responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <!-- Skill Match Section -->
        <div class="section">
          <h2>Skill Match Analysis</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${analysis.skillMatch.overallScore}%</div>
              <div class="stat-label">Overall Match</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analysis.skillMatch.matched.length}</div>
              <div class="stat-label">Matched Skills</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analysis.skillMatch.partiallyMatched.length}</div>
              <div class="stat-label">Partially Matched</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analysis.skillMatch.missing.length}</div>
              <div class="stat-label">Missing Skills</div>
            </div>
          </div>
          <h3>Matched Skills</h3>
          <div class="skills-list">
            ${analysis.skillMatch.matched.map(s => `<span class="skill-badge matched">${s}</span>`).join('')}
          </div>
          <h3>Partially Matched Skills</h3>
          <div class="skills-list">
            ${analysis.skillMatch.partiallyMatched.map(s => `<span class="skill-badge partial">${s}</span>`).join('')}
          </div>
          <h3>Missing Skills</h3>
          <div class="skills-list">
            ${analysis.skillMatch.missing.map(s => `<span class="skill-badge missing">${s}</span>`).join('')}
          </div>
        </div>

        <!-- Experience Match Section -->
        <div class="section">
          <h2>Experience Analysis</h2>
          <p><strong>Your Experience:</strong> ${analysis.experienceMatch.yearsOfExperience} years</p>
          <p><strong>Required Experience:</strong> ${analysis.experienceMatch.requiredYears} years</p>
          <div class="verdict ${analysis.experienceMatch.verdict}">
            ${analysis.experienceMatch.verdict.toUpperCase()}
          </div>
          <h3>Relevant Roles You've Had</h3>
          <ul>
            ${analysis.experienceMatch.relevantRoles.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <!-- Education Match Section -->
        <div class="section">
          <h2>Education Analysis</h2>
          <p><strong>Status:</strong> ${analysis.educationMatch.aligned ? 'Aligned ✓' : 'Not Aligned'}</p>
          <div class="feedback">${analysis.educationMatch.feedback}</div>
        </div>

        <!-- ATS Score Section -->
        <div class="section">
          <h2>ATS Compatibility Score</h2>
          <div class="stat-card">
            <div class="stat-value">${analysis.atsScore.score}/100</div>
            <div class="stat-label">ATS Score</div>
          </div>
          <h3>Matched Keywords</h3>
          <div class="skills-list">
            ${analysis.atsScore.matchedKeywords.slice(0, 15).map(k => `<span class="skill-badge matched">${k}</span>`).join('')}
          </div>
          <h3>Missing Keywords</h3>
          <div class="skills-list">
            ${analysis.atsScore.missingKeywords.slice(0, 15).map(k => `<span class="skill-badge missing">${k}</span>`).join('')}
          </div>
        </div>

        <!-- Recommendations Section -->
        <div class="section">
          <h2>Personalized Recommendations</h2>
          <h3>Skills to Learn</h3>
          ${analysis.recommendations.skillsToLearn.map(s => `
            <div class="recommendation">
              <strong>${s.skill}</strong> (Priority: ${s.priority})
            </div>
          `).join('')}
          <h3>Resume Improvements</h3>
          <ul>
            ${analysis.recommendations.resumeImprovements.map(r => `<li>${r}</li>`).join('')}
          </ul>
          <h3>Section Feedback</h3>
          <div class="feedback"><strong>Summary:</strong> ${analysis.recommendations.sectionFeedback.summary}</div>
          <div class="feedback"><strong>Skills:</strong> ${analysis.recommendations.sectionFeedback.skills}</div>
          <div class="feedback"><strong>Experience:</strong> ${analysis.recommendations.sectionFeedback.experience}</div>
        </div>

        <!-- Overall Fit Section -->
        <div class="section">
          <h2>Overall Assessment</h2>
          <div class="verdict ${analysis.overallFit.verdict}">
            ${analysis.overallFit.verdict.toUpperCase()} FIT (${analysis.overallFit.score}%)
          </div>
          <div class="feedback">${analysis.overallFit.summary}</div>
        </div>

        <div class="footer">
          <p>This report was generated by SKILORA AI-Powered Resume Analyzer</p>
          <p>For more detailed feedback and learning resources, visit the platform dashboard</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const element = document.createElement('a')
    const file = new Blob([reportHTML], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `Resume_Analysis_Report_${new Date().getTime()}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case 'strong':
        return 'bg-green-500/10 border-green-500/30'
      case 'partial':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'weak':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Microscope className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Professional Resume Analyzer</h1>
          </div>
          <p className="text-gray-400">
            Upload your resume and job description. Our AI will analyze the fit like a careful recruiter with a microscope in one hand and a checklist in the other 🧭
          </p>
        </div>

        {!analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Resume Section */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!resume ? (
                  <div
                    className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
                    onClick={() => resumeFileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-gray-300 font-medium">Click to upload resume</p>
                    <p className="text-gray-500 text-sm">Supports PDF or TXT files</p>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-sm text-gray-400 mb-2">File: {resumeFileName}</p>
                    <div className="bg-slate-950 rounded p-3 h-40 overflow-y-auto text-gray-300 text-sm">
                      {resume.substring(0, 500)}...
                    </div>
                    <Button
                      onClick={removeResume}
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
                <input
                  ref={resumeFileInputRef}
                  type="file"
                  accept=".txt,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleResumeUpload(e.target.files[0])
                  }}
                  className="hidden"
                />
                {!resume && (
                  <Button
                    onClick={() => resumeFileInputRef.current?.click()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Job Description Section */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-400" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-64 bg-slate-800 border-slate-700 text-white"
                />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {!analysis && (
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !resume || !jobDescription}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analyze Resume & Job Fit
              </>
            )}
          </Button>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Fit Score */}
            <Card className={`border ${getVerdictBg(analysis.overallFit.verdict)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Overall Job Fit Assessment
                  </div>
                  <div className={`text-4xl font-bold ${getVerdictColor(analysis.overallFit.verdict)}`}>
                    {analysis.overallFit.score}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className={`text-lg font-semibold ${getVerdictColor(analysis.overallFit.verdict)}`}>
                    {analysis.overallFit.verdict.charAt(0).toUpperCase() + analysis.overallFit.verdict.slice(1)} Fit
                  </p>
                  <p className="text-gray-300">{analysis.overallFit.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Job Overview & Resume Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Overview */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-xl">📊 Job Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Job Title</p>
                    <p className="text-white font-semibold">{analysis.jobOverview.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Company</p>
                    <p className="text-white font-semibold">{analysis.jobOverview.company}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Employment Type</p>
                      <p className="text-white">{analysis.jobOverview.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Experience Required</p>
                      <p className="text-white">{analysis.jobOverview.experience}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Education</p>
                    <p className="text-white">{analysis.jobOverview.education}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Summary */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-xl">📄 Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{analysis.resumeData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white text-sm">{analysis.resumeData.contact.email || 'Not found'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Total Experience</p>
                    <p className="text-white">{analysis.experienceMatch.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Education</p>
                    <p className="text-white">
                      {analysis.resumeData.education[0]?.degree || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skill Match Analysis */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Skill Match Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Overall Match Score</span>
                    <span className={`text-2xl font-bold ${getVerdictColor('strong')}`}>
                      {analysis.skillMatch.overallScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${analysis.skillMatch.overallScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-green-400 font-semibold text-lg">{analysis.skillMatch.matched.length}</p>
                    <p className="text-gray-300 text-sm">Matched Skills</p>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-yellow-400 font-semibold text-lg">
                      {analysis.skillMatch.partiallyMatched.length}
                    </p>
                    <p className="text-gray-300 text-sm">Partial Skills</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                    <p className="text-red-400 font-semibold text-lg">{analysis.skillMatch.missing.length}</p>
                    <p className="text-gray-300 text-sm">Missing Skills</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {analysis.skillMatch.matched.length > 0 && (
                    <div>
                      <p className="text-green-400 font-semibold mb-2">✓ Matched Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillMatch.matched.slice(0, 8).map((skill) => (
                          <Badge key={skill} className="bg-green-500/20 text-green-300 border-green-500/30">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.skillMatch.missing.length > 0 && (
                    <div>
                      <p className="text-red-400 font-semibold mb-2">✗ Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillMatch.missing.slice(0, 8).map((skill) => (
                          <Badge key={skill} className="bg-red-500/20 text-red-300 border-red-500/30">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience & Education Match */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Verdict</p>
                    <p className={`text-lg font-semibold ${getVerdictColor(analysis.experienceMatch.verdict)}`}>
                      {analysis.experienceMatch.verdict.charAt(0).toUpperCase() +
                        analysis.experienceMatch.verdict.slice(1)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-sm">Your Experience</p>
                      <p className="text-white font-semibold">{analysis.experienceMatch.yearsOfExperience} yrs</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Required</p>
                      <p className="text-white font-semibold">{analysis.experienceMatch.requiredYears} yrs</p>
                    </div>
                  </div>
                  {analysis.experienceMatch.relevantRoles.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Relevant Roles</p>
                      <div className="space-y-1">
                        {analysis.experienceMatch.relevantRoles.slice(0, 3).map((role) => (
                          <p key={role} className="text-gray-300 text-sm">
                            • {role}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Education Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {analysis.educationMatch.aligned ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className={analysis.educationMatch.aligned ? 'text-green-400' : 'text-yellow-400'}>
                      {analysis.educationMatch.aligned ? 'Aligned' : 'Partial'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{analysis.educationMatch.feedback}</p>
                </CardContent>
              </Card>
            </div>

            {/* ATS Score */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  ATS Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">ATS Score</span>
                    <span className="text-2xl font-bold text-purple-400">{analysis.atsScore.score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${analysis.atsScore.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <p className="text-green-400 font-semibold">{analysis.atsScore.matchedKeywords.length}</p>
                    <p className="text-gray-300 text-sm">Keywords Matched</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <p className="text-red-400 font-semibold">{analysis.atsScore.missingKeywords.length}</p>
                    <p className="text-gray-300 text-sm">Keywords Missing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gap Analysis */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis.gapAnalysis.missingSkills.length > 0 && (
                  <div>
                    <p className="text-red-400 font-semibold mb-3">❌ Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.gapAnalysis.missingSkills.map((skill) => (
                        <Badge key={skill} className="bg-red-500/20 text-red-300 border-red-500/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.gapAnalysis.improvementAreas.length > 0 && (
                  <div>
                    <p className="text-yellow-400 font-semibold mb-3">⚠ Areas for Improvement</p>
                    <ul className="space-y-2">
                      {analysis.gapAnalysis.improvementAreas.map((area, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.gapAnalysis.genericPhrases.length > 0 && (
                  <div>
                    <p className="text-blue-400 font-semibold mb-3">💬 Generic Phrases to Replace</p>
                    <ul className="space-y-2">
                      {analysis.gapAnalysis.genericPhrases.map((phrase, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>"{phrase}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Skills to Learn (Prioritized)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.skillsToLearn.map((skill, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-700 last:border-0">
                      <Badge className={getPriorityColor(skill.priority)}>{skill.priority}</Badge>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{skill.skill}</p>
                        {skill.resources && skill.resources.length > 0 && (
                          <p className="text-gray-400 text-sm mt-1">Resources: {skill.resources.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section Feedback */}
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-cyan-400" />
                  Section-wise Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.recommendations.sectionFeedback).map(([section, feedback]) => (
                  <div key={section} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="text-cyan-400 font-semibold capitalize mb-2">{section}</p>
                    <p className="text-gray-300 text-sm">{feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Course Recommendations */}
            {analysis.courseRecommendations.length > 0 && (
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    Recommended Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.courseRecommendations.map((course, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-white font-semibold">{course.name}</p>
                          <Badge
                            className={
                              course.relevance === 'critical'
                                ? 'bg-red-500/20 text-red-300'
                                : course.relevance === 'important'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-blue-500/20 text-blue-300'
                            }
                          >
                            {course.relevance}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>{course.provider}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Jobs */}
            {analysis.relatedJobs.length > 0 && (
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-400" />
                    Related Job Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.relatedJobs.map((job, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-white font-semibold">{job.title}</p>
                          <span className="text-teal-400 font-bold">{job.matchPercentage}%</span>
                        </div>
                        <p className="text-gray-400 text-sm">{job.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setAnalysis(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600"
              >
                Analyze Another Resume
              </Button>
              <Button 
                onClick={generatePDFReport}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}
