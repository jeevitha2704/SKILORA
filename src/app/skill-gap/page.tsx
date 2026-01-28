'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth'
import { 
  getUserSkills, 
  getJobAnalyses, 
  getSkillComparisons,
  createSkillComparison,
  ParsedSkill,
  SkillComparison
} from '@/lib/database'
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Brain,
  BarChart3,
  Briefcase,
  Microscope,
  BookOpen,
  Zap,
  Lightbulb,
  Map,
  Users
} from 'lucide-react'

interface SkillGapData {
  skill: string
  required: number
  current: number
  status: 'match' | 'partial' | 'missing'
  category: string
  gapPercentage: number
}

 interface SkillGapAIAnalysis {
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
 }

export default function SkillGap() {
  const { user } = useAuth()
  const router = useRouter()
  const [userSkills, setUserSkills] = useState<any[]>([])
  const [jobAnalyses, setJobAnalyses] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [skillComparisons, setSkillComparisons] = useState<SkillComparison[]>([])
  const [skillGapData, setSkillGapData] = useState<SkillGapData[]>([])
  const [aiSkillGapAnalysis, setAiSkillGapAnalysis] = useState<SkillGapAIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const analysisMode: 'job' = 'job'

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      const [skills, jobs] = await Promise.all([
        getUserSkills(user?.id || '').catch(err => {
          console.error('Error loading user skills:', err)
          return []
        }),
        getJobAnalyses(user?.id || '').catch(err => {
          console.error('Error loading job analyses:', err)
          return []
        })
      ])
      
      setUserSkills(skills)
      setJobAnalyses(jobs)
      
      if (jobs.length > 0) {
        setSelectedJob(jobs[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Set empty state to prevent infinite loading
      setUserSkills([])
      setJobAnalyses([])
    } finally {
      setLoading(false)
    }
  }

  const getSkillLevelValue = (level: string): number => {
    switch (level) {
      case 'beginner': return 25
      case 'intermediate': return 50
      case 'advanced': return 75
      case 'expert': return 100
      default: return 0
    }
  }

  const analyzeSkillGap = async () => {
    if (!selectedJob) return

    setAnalyzing(true)
    try {
      // Prefer AI-based skill gap analysis (Skilora master prompt)
      const jobAnalysis = jobAnalyses.find(job => job.id === selectedJob)
      if (jobAnalysis && Array.isArray(jobAnalysis.parsed_skills)) {
        const normalizedUserSkills = userSkills
          .filter((s: any) => s?.skill_name)
          .map((s: any) => ({
            name: s.skill_name,
            level: s.level,
            category: s.category
          }))

        if (normalizedUserSkills.length > 0) {
          const aiResponse = await fetch('/api/analyze-skill-gap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              job_requirements: {
                title: jobAnalysis.title,
                company: jobAnalysis.company,
                required_skills: jobAnalysis.parsed_skills
              },
              user_skills: normalizedUserSkills,
              experience_level: jobAnalysis.experience
            })
          })

          const aiData = await aiResponse.json()

          if (aiResponse.ok && aiData?.analysis?.skill_gap_summary) {
            setAiSkillGapAnalysis(aiData.analysis)
            const summary = aiData.analysis.skill_gap_summary

            const strongSet = new Set((summary.strong_matches || []).map((s: string) => s.toLowerCase()))
            const partialSet = new Set((summary.partial_matches || []).map((s: string) => s.toLowerCase()))
            const missingSet = new Set((summary.missing_skills || []).map((s: string) => s.toLowerCase()))

            const toPercent = (level: any): number => {
              if (typeof level === 'number') {
                // DB levels are usually 0-4
                return Math.max(0, Math.min(100, Math.round((level / 4) * 100)))
              }
              return getSkillLevelValue(String(level))
            }

            const gapData: SkillGapData[] = jobAnalysis.parsed_skills.map((requiredSkill: ParsedSkill) => {
              const key = requiredSkill.name.toLowerCase()

              const userSkill = userSkills.find((s: any) =>
                (s.skill_name || '').toLowerCase() === key
              )

              const currentPct = userSkill ? toPercent(userSkill.level) : 0

              let status: 'match' | 'partial' | 'missing' = 'missing'
              if (strongSet.has(key)) status = 'match'
              else if (partialSet.has(key)) status = 'partial'
              else if (missingSet.has(key)) status = 'missing'

              return {
                skill: requiredSkill.name,
                required: 100,
                current: currentPct,
                status,
                category: requiredSkill.category,
                gapPercentage: Math.max(0, 100 - currentPct)
              }
            })

            setSkillGapData(gapData)
            
            // Save analyzed job data to localStorage for roadmap page
            const jobData = jobAnalyses.find(job => job.id === selectedJob)
            const roadmapData = {
              jobTitle: jobData.title,
              jobCompany: jobData.company,
              jobRole: jobData.title,
              skillGapAnalysis: aiData.analysis,
              skillGapData: gapData,
              analyzedAt: new Date().toISOString()
            }
            localStorage.setItem('analyzedJobForRoadmap', JSON.stringify(roadmapData))
            
            setSkillComparisons([])
            return
          }
        }
      }

      setAiSkillGapAnalysis(null)

      // Get existing comparisons
      const existingComparisons = await getSkillComparisons(user?.id || '', selectedJob)
      
      if (existingComparisons.length > 0) {
        setSkillComparisons(existingComparisons)
        generateSkillGapData(existingComparisons)
      } else {
        // Perform new analysis
        const jobAnalysis = jobAnalyses.find(job => job.id === selectedJob)
        if (!jobAnalysis) return

        const comparisons: Omit<SkillComparison, 'id' | 'user_id' | 'job_analysis_id' | 'created_at'>[] = []
        
        jobAnalysis.parsed_skills.forEach((requiredSkill: ParsedSkill) => {
          const userSkill = userSkills.find(skill => 
            skill.skill_name.toLowerCase() === requiredSkill.name.toLowerCase()
          )
          
          const currentLevel = userSkill ? userSkill.level : 0
          const requiredLevel = getSkillLevelNumber(requiredSkill.level)
          
          let status: 'match' | 'partial' | 'missing'
          if (currentLevel === 0) {
            status = 'missing'
          } else if (currentLevel >= requiredLevel) {
            status = 'match'
          } else {
            status = 'partial'
          }

          comparisons.push({
            skill_name: requiredSkill.name,
            required_level: requiredLevel,
            current_level: currentLevel,
            status,
            category: requiredSkill.category
          })
        })

        // Save comparisons to database
        const savedComparisons = await createSkillComparison(
          user?.id || '', 
          selectedJob, 
          comparisons
        )
        
        setSkillComparisons(savedComparisons)
        generateSkillGapData(savedComparisons)
      }
    } catch (error) {
      console.error('Error analyzing skill gap:', error)
      setAiSkillGapAnalysis(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const generateSkillGapData = (comparisons: SkillComparison[]) => {
    const gapData: SkillGapData[] = comparisons.map(comp => ({
      skill: comp.skill_name,
      required: comp.required_level,
      current: comp.current_level,
      status: comp.status,
      category: comp.category,
      gapPercentage: comp.required_level > 0 
        ? Math.max(0, ((comp.required_level - comp.current_level) / comp.required_level) * 100)
        : 0
    }))

    setSkillGapData(gapData)
  }

  const getSkillLevelNumber = (level: string): number => {
    switch (level) {
      case 'beginner': return 1
      case 'intermediate': return 2
      case 'advanced': return 3
      case 'expert': return 4
      default: return 2
    }
  }

  const getSkillLevelLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Intermediate'
      case 3: return 'Advanced'
      case 4: return 'Expert'
      default: return 'Unknown'
    }
  }

  const calculateOverallMatch = (): number => {
    if (skillGapData.length === 0) return 0
    
    const totalSkills = skillGapData.length
    const matchedSkills = skillGapData.filter(skill => skill.status === 'match').length
    const partialSkills = skillGapData.filter(skill => skill.status === 'partial').length
    
    return Math.round(((matchedSkills + partialSkills * 0.5) / totalSkills) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'missing': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match': return <CheckCircle className="h-4 w-4" />
      case 'partial': return <AlertTriangle className="h-4 w-4" />
      case 'missing': return <Target className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getSkillsByStatus = (status: string) => {
    return skillGapData.filter(skill => skill.status === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading skill gap analysis...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
          <Card className="glass border-white/10 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Please Sign In
              </h3>
              <p className="text-gray-400 mb-6">
                You need to be signed in to analyze your skill gaps
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth/signin">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Compare your current skills with job requirements to identify areas for improvement
          </p>
        </div>

        {/* Job Selection */}
        {analysisMode === 'job' && jobAnalyses.length > 0 && (
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Select Job Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userSkills.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    💡 <strong>Tip:</strong> Add some skills to your profile first to get a complete skill gap analysis!
                  </p>
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobAnalyses.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedJob === job.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <h3 className="font-semibold text-white mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{job.company}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.parsed_skills?.length || 0} skills
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {job.experience || 'Not specified'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  onClick={analyzeSkillGap}
                  disabled={!selectedJob || analyzing}
                  className="bg-primary text-white hover:bg-primary/90 relative z-10"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Skill Gap'}
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Jobs Message */}
        {analysisMode === 'job' && jobAnalyses.length === 0 && (
          <Card className="glass border-white/10 mb-8">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Job Analyses Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Analyze a job description first to compare your skills
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/analyzer">
                  Analyze a Job
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Skill Gap Results - PROFESSIONAL LAYOUT */}
        {skillGapData.length > 0 && (
          <div className="space-y-8">
            {/* 1. LATEST JOB OVERVIEW - Top Section */}
            {analysisMode === 'job' && jobAnalyses.find(j => j.id === selectedJob) && (
              <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Job Title</p>
                      <h3 className="text-white text-xl font-bold">
                        {jobAnalyses.find(j => j.id === selectedJob)?.title}
                      </h3>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Company</p>
                      <p className="text-white font-semibold">
                        {jobAnalyses.find(j => j.id === selectedJob)?.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Experience</p>
                      <p className="text-white font-semibold">
                        {jobAnalyses.find(j => j.id === selectedJob)?.experience || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Skills Required</p>
                      <p className="text-white font-bold text-2xl">
                        {skillGapData.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. SKILL MATCH SUMMARY (Quick Snapshot) */}
            <div className="grid lg:grid-cols-4 gap-4">
              <Card className="glass border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Overall Match</p>
                      <p className="text-green-400 text-3xl font-bold">
                        {calculateOverallMatch()}%
                      </p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-400 opacity-20" />
                  </div>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${calculateOverallMatch()}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Matched Skills</p>
                      <p className="text-blue-400 text-3xl font-bold">
                        {getSkillsByStatus('match').length}
                      </p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-blue-400 opacity-20" />
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    Skills you already have
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Partial Skills</p>
                      <p className="text-yellow-400 text-3xl font-bold">
                        {getSkillsByStatus('partial').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-yellow-400 opacity-20" />
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    Need to strengthen
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 bg-gradient-to-br from-red-500/10 to-red-600/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Missing Skills</p>
                      <p className="text-red-400 text-3xl font-bold">
                        {getSkillsByStatus('missing').length}
                      </p>
                    </div>
                    <Target className="h-12 w-12 text-red-400 opacity-20" />
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    Need to acquire
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3. CRITICAL POINTS & HIGHLIGHTS */}
            {analysisMode === 'job' && aiSkillGapAnalysis && (
              <Card className="glass border-white/10 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Critical Points & Priority Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid lg:grid-cols-3 gap-4">
                    {/* High Priority */}
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        HIGH PRIORITY ({(aiSkillGapAnalysis.priority_classification?.high_priority || []).length})
                      </h4>
                      <div className="space-y-2">
                        {(aiSkillGapAnalysis.priority_classification?.high_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.high_priority.map((skill, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-red-400 font-bold">•</span>
                              <span className="text-gray-300 text-sm">{skill}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">No critical gaps</p>
                        )}
                      </div>
                    </div>

                    {/* Medium Priority */}
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        MEDIUM PRIORITY ({(aiSkillGapAnalysis.priority_classification?.medium_priority || []).length})
                      </h4>
                      <div className="space-y-2">
                        {(aiSkillGapAnalysis.priority_classification?.medium_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.medium_priority.map((skill, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-yellow-400 font-bold">•</span>
                              <span className="text-gray-300 text-sm">{skill}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">None</p>
                        )}
                      </div>
                    </div>

                    {/* Low Priority */}
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        NICE-TO-HAVE ({(aiSkillGapAnalysis.priority_classification?.low_priority || []).length})
                      </h4>
                      <div className="space-y-2">
                        {(aiSkillGapAnalysis.priority_classification?.low_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.low_priority.map((skill, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-green-400 font-bold">•</span>
                              <span className="text-gray-300 text-sm">{skill}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">None</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. SKILL CATEGORIZATION VIEW - Detailed Breakdown */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-cyan-400" />
                  Detailed Skill Analysis by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Technical Skills */}
                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded"></span>
                      Technical Skills
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left text-gray-400 py-2 px-3 text-sm">Skill</th>
                            <th className="text-left text-gray-400 py-2 px-3 text-sm">Job Needs</th>
                            <th className="text-left text-gray-400 py-2 px-3 text-sm">Your Level</th>
                            <th className="text-left text-gray-400 py-2 px-3 text-sm">Status</th>
                            <th className="text-left text-gray-400 py-2 px-3 text-sm">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skillGapData.filter(s => s.category === 'technical').map((skill, idx) => (
                            <tr key={idx} className="border-b border-gray-700/50 hover:bg-white/5 transition">
                              <td className="py-3 px-3 text-white font-medium text-sm">{skill.skill}</td>
                              <td className="py-3 px-3 text-gray-300 text-sm">{getSkillLevelLabel(skill.required)}</td>
                              <td className="py-3 px-3 text-gray-300 text-sm">
                                {skill.current > 0 ? getSkillLevelLabel(skill.current) : 'No experience'}
                              </td>
                              <td className="py-3 px-3">
                                <Badge className={`text-xs border ${
                                  skill.status === 'match' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  skill.status === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}>
                                  {skill.status === 'match' ? '✓ Match' : skill.status === 'partial' ? '⚠ Partial' : '✗ Missing'}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      skill.status === 'match' ? 'bg-green-500' :
                                      skill.status === 'partial' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (skill.current / skill.required) * 100)}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tools & Frameworks */}
                  {skillGapData.some(s => s.category === 'tool') && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded"></span>
                        Tools & Frameworks
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="text-left text-gray-400 py-2 px-3 text-sm">Tool</th>
                              <th className="text-left text-gray-400 py-2 px-3 text-sm">Priority</th>
                              <th className="text-left text-gray-400 py-2 px-3 text-sm">Status</th>
                              <th className="text-left text-gray-400 py-2 px-3 text-sm">Gap</th>
                            </tr>
                          </thead>
                          <tbody>
                            {skillGapData.filter(s => s.category === 'tool').map((skill, idx) => (
                              <tr key={idx} className="border-b border-gray-700/50 hover:bg-white/5 transition">
                                <td className="py-3 px-3 text-white font-medium text-sm">{skill.skill}</td>
                                <td className="py-3 px-3 text-gray-300 text-sm">
                                  {skill.gapPercentage > 75 ? 'High' : skill.gapPercentage > 25 ? 'Medium' : 'Low'}
                                </td>
                                <td className="py-3 px-3">
                                  <Badge className={`text-xs border ${
                                    skill.status === 'match' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                    skill.status === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                    'bg-red-500/20 text-red-300 border-red-500/30'
                                  }`}>
                                    {skill.status === 'match' ? 'Have it' : skill.status === 'partial' ? 'Partial' : 'Need it'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3 text-gray-300 text-sm">{Math.round(skill.gapPercentage)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {skillGapData.some(s => s.category === 'soft') && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="w-1 h-6 bg-pink-500 rounded"></span>
                        Soft Skills
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {skillGapData.filter(s => s.category === 'soft').map((skill, idx) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{skill.skill}</span>
                              <Badge className={`text-xs border ${
                                skill.status === 'match' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                skill.status === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}>
                                {skill.status === 'match' ? '✓' : skill.status === 'partial' ? '⚠' : '✗'}
                              </Badge>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  skill.status === 'match' ? 'bg-green-500' :
                                  skill.status === 'partial' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, (skill.current / skill.required) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 5. RESUME EVIDENCE MAPPING */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Where Skills Were Found in Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSkillsByStatus('match').length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-semibold mb-3">Matched Skills</h4>
                    <div className="space-y-2">
                      {getSkillsByStatus('match').slice(0, 5).map((skill, idx) => (
                        <div key={idx} className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                          <p className="text-white font-medium text-sm">{skill.skill}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Found in: Work Experience • Skills Section • Projects
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 6. ACTION-ORIENTED RECOMMENDATIONS & ROADMAP */}
            {analysisMode === 'job' && aiSkillGapAnalysis && (
              <Card className="glass border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="h-5 w-5 text-cyan-400" />
                    Your Learning Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSkillGapAnalysis.gap_insights && aiSkillGapAnalysis.gap_insights.length > 0 && (
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <h4 className="text-cyan-400 font-bold mb-3">Key Insights</h4>
                      <ul className="space-y-2">
                        {aiSkillGapAnalysis.gap_insights.map((insight, i) => (
                          <li key={i} className="flex gap-2 text-gray-300 text-sm">
                            <span className="text-cyan-400 font-bold">→</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSkillGapAnalysis.next_best_skill && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-blue-400 font-bold mb-3">Next Skill to Learn</h4>
                      <div className="space-y-2">
                        <p className="text-white font-semibold text-lg">{aiSkillGapAnalysis.next_best_skill.skill}</p>
                        <p className="text-gray-300 text-sm">{aiSkillGapAnalysis.next_best_skill.reason}</p>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Estimated effort: {aiSkillGapAnalysis.next_best_skill.estimated_effort}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 7. FINAL DECISION PANEL */}
            <Card className={`glass border ${
              calculateOverallMatch() >= 80 ? 'border-green-500/30 bg-green-500/10' :
              calculateOverallMatch() >= 60 ? 'border-yellow-500/30 bg-yellow-500/10' :
              'border-red-500/30 bg-red-500/10'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  calculateOverallMatch() >= 80 ? 'text-green-400' :
                  calculateOverallMatch() >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  <Target className="h-5 w-5" />
                  Job Readiness Verdict
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className={`text-3xl font-bold ${
                    calculateOverallMatch() >= 80 ? 'text-green-400' :
                    calculateOverallMatch() >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {calculateOverallMatch() >= 80 ? '✓ READY TO APPLY' : 
                     calculateOverallMatch() >= 60 ? '⚠ NEEDS UPSKILLING' :
                     '✗ REQUIRES SIGNIFICANT PREPARATION'}
                  </div>
                </div>
                <p className={`text-sm ${
                  calculateOverallMatch() >= 80 ? 'text-green-300' :
                  calculateOverallMatch() >= 60 ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {calculateOverallMatch() >= 80 
                    ? 'You have strong alignment with this role. Consider applying now and continuing to develop secondary skills.'
                    : calculateOverallMatch() >= 60 
                    ? 'You have good foundational skills but should focus on the identified gaps. Plan 1-2 months of focused learning.'
                    : 'Significant skill gaps exist. Dedicate 2-4 months to acquire critical skills before applying.'}
                </p>
              </CardContent>
            </Card>

            {/* 8. ACTION BUTTONS */}
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12">
                <Link href="/skill-roadmap" className="flex items-center justify-center gap-2">
                  <Map className="h-4 w-4" />
                  Get Personalized Roadmap
                </Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 h-12">
                <Link href="/analyzer" className="flex items-center justify-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analyze Another Job
                </Link>
              </Button>
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 h-12">
                <Link href="/resume-analyzer" className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resume Analysis
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
