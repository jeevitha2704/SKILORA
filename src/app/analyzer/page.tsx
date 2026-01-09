'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { Brain, Sparkles, FileSearch, Loader2, ArrowRight, Briefcase, GraduationCap, Clock, Upload, FileText, User } from 'lucide-react'

interface ParsedSkill {
  name: string
  category: 'technical' | 'soft' | 'tool' | 'domain'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  required: boolean
}

interface ParsedJD {
  title: string
  company: string
  experience: string
  education: string
  skills: ParsedSkill[]
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

const sampleJD = `Full Stack Developer at TechCorp

We are looking for a talented Full Stack Developer to join our growing team. You will be responsible for building and maintaining web applications using modern technologies.

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in JavaScript, TypeScript, and React
- Experience with Node.js, Express, and MongoDB
- Knowledge of RESTful APIs and GraphQL
- Familiarity with cloud platforms (AWS, Azure)
- Understanding of agile methodologies and DevOps
- Excellent problem-solving and communication skills

Responsibilities:
- Develop and maintain scalable web applications
- Design and implement RESTful APIs
- Collaborate with cross-functional teams
- Write clean, maintainable, and well-documented code
- Participate in code reviews and provide constructive feedback

Education: Bachelor's degree in Computer Science or related field
Experience: 5+ years
Location: Remote`

export default function JobAnalyzer() {
  const { user } = useAuth()
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [analysis, setAnalysis] = useState<ParsedJD | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'advanced': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'expert': return 'bg-teal-500/20 text-teal-400 border-teal-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'soft': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'tool': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'domain': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const analyzeJob = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description to analyze')
      return
    }

    setIsLoading(true)
    
    try {
      // Call the real AI API
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          resume: resume.trim(),
          userId: user?.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      // Convert API response to our component format
      const analysis: ParsedJD = {
        title: data.analysis.jobTitle || 'Position',
        company: data.analysis.company || 'Company',
        experience: data.analysis.experienceLevel || 'Not specified',
        education: data.analysis.educationRequirements || 'Not specified',
        skills: data.analysis.requiredSkills.map((skill: any) => ({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          required: skill.required
        })),
        resumeMatch: data.analysis.resumeMatch
      }

      setAnalysis(analysis)
    } catch (error) {
      console.error('Analysis error:', error)
      // You could show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setResume(text)
      }
      reader.readAsText(file)
    }
  }

  const removeResume = () => {
    setResume('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadSample = () => {
    setJobDescription(sampleJD)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
            <Brain className="h-4 w-4 mr-2" />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4 font-space-grotesk">
            Job Description Analyzer
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered extraction of skills, requirements, and insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Resume Upload Card */}
            <Card className="glass-accent hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!resume ? (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-white mb-2">Upload your resume</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Supports TXT, PDF, DOC, DOCX files
                    </p>
                    <div className="bg-white rounded-md px-4 py-2 inline-block cursor-pointer hover:bg-gray-100 transition-colors">
                      <span 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-800 font-medium"
                      >
                        Choose File
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-white font-medium">Resume uploaded</p>
                          <p className="text-gray-400 text-sm">Ready for analysis</p>
                        </div>
                      </div>
                      <Button
                        onClick={removeResume}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto bg-background/30 rounded-lg p-3">
                      <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                        {resume.substring(0, 500)}{resume.length > 500 ? '...' : ''}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-teal hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-primary" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here or describe your target role..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] bg-background/50 border-white/20 text-white placeholder:text-gray-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={analyzeJob}
                    disabled={(!jobDescription.trim() && !resume.trim()) || isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                  <Button variant="glass" size="lg" onClick={loadSample}>
                    Load Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Job Info Card */}
                <Card className="glass-orange hover-lift animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Job Information
                      </div>
                      <Badge className="bg-success/10 text-success border-success/30">
                        NLP Processed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {analysis.title}
                      </h3>
                      <p className="text-gray-400">{analysis.company}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-400">Experience</p>
                          <p className="text-white font-medium">{analysis.experience}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-400">Education</p>
                          <p className="text-white font-medium">{analysis.education}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extracted Skills Card */}
                <Card className="glass-green hover-lift animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Extracted Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Skills by category */}
                      {['technical', 'tool', 'soft', 'domain'].map(category => {
                        const categorySkills = analysis.skills.filter(skill => skill.category === category)
                        if (categorySkills.length === 0) return null
                        
                        return (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-white mb-2 capitalize">{category} Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {categorySkills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <Badge className={getSkillLevelColor(skill.level)}>
                                    {skill.name}
                                  </Badge>
                                  <Badge className={getCategoryColor(skill.category)} variant="outline">
                                    {skill.level}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Resume Comparison Card */}
                {resume && analysis?.resumeMatch && (
                  <Card className="glass-green hover-lift animate-scale-in">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Resume-JD Match Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-background/30 rounded-lg">
                            <div className="text-2xl font-bold text-success mb-1">{analysis.resumeMatch.overallMatch}%</div>
                            <div className="text-sm text-gray-400">Overall Match</div>
                          </div>
                          <div className="text-center p-4 bg-background/30 rounded-lg">
                            <div className="text-2xl font-bold text-warning mb-1">{analysis.resumeMatch.skillsGap}</div>
                            <div className="text-sm text-gray-400">Skills Gap</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Technical Skills Match</span>
                            <span className="text-sm text-success">{analysis.resumeMatch.technicalMatch}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Experience Match</span>
                            <span className="text-sm text-warning">{analysis.resumeMatch.experienceMatch}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Education Match</span>
                            <span className="text-sm text-success">{analysis.resumeMatch.educationMatch}%</span>
                          </div>
                        </div>
                        {analysis.resumeMatch.matchedSkills.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Matched Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.resumeMatch.matchedSkills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} className="bg-success/10 text-success border-success/30 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {analysis.resumeMatch.matchedSkills.length > 5 && (
                                <span className="text-xs text-gray-400">+{analysis.resumeMatch.matchedSkills.length - 5} more</span>
                              )}
                            </div>
                          </div>
                        )}
                        {analysis.resumeMatch.missingSkills.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Missing Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.resumeMatch.missingSkills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {analysis.resumeMatch.missingSkills.length > 5 && (
                                <span className="text-xs text-gray-400">+{analysis.resumeMatch.missingSkills.length - 5} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Legend */}
                <Card className="glass-accent hover-lift animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Skill Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <span className="text-sm text-gray-300">Beginner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-info rounded-full"></div>
                        <span className="text-sm text-gray-300">Intermediate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm text-gray-300">Advanced</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                        <span className="text-sm text-gray-300">Expert</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps Card */}
                <Card className="glass border-white/10 animate-scale-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Ready for Next Steps?</h3>
                        <p className="text-gray-400 text-sm">Compare your skills with job requirements</p>
                      </div>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/skill-gap">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Empty State */
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <FileSearch className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-gray-400">
                    Paste a job description and click "Analyze with AI" to see the results here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
