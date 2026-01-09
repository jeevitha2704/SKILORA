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
  BarChart3
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

        {/* Skill Gap Results */}
        {skillGapData.length > 0 && (
          <div className="space-y-8">
            {analysisMode === 'job' && aiSkillGapAnalysis && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Job Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-3">
                      {typeof aiSkillGapAnalysis.job_readiness_estimate === 'number'
                        ? `${aiSkillGapAnalysis.job_readiness_estimate}%`
                        : `${calculateOverallMatch()}%`}
                    </div>
                    <ProgressBar
                      value={
                        typeof aiSkillGapAnalysis.job_readiness_estimate === 'number'
                          ? aiSkillGapAnalysis.job_readiness_estimate
                          : calculateOverallMatch()
                      }
                      className="h-3"
                    />
                  </CardContent>
                </Card>

                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Priority Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">High Priority</div>
                      <div className="flex flex-wrap gap-2">
                        {(aiSkillGapAnalysis.priority_classification?.high_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.high_priority.map((s, i) => (
                            <Badge key={`hp-${i}`} className="bg-red-500/20 text-red-300 border border-red-500/30">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-white mb-2">Medium Priority</div>
                      <div className="flex flex-wrap gap-2">
                        {(aiSkillGapAnalysis.priority_classification?.medium_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.medium_priority.map((s, i) => (
                            <Badge key={`mp-${i}`} className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-white mb-2">Low Priority</div>
                      <div className="flex flex-wrap gap-2">
                        {(aiSkillGapAnalysis.priority_classification?.low_priority || []).length > 0 ? (
                          aiSkillGapAnalysis.priority_classification!.low_priority.map((s, i) => (
                            <Badge key={`lp-${i}`} className="bg-green-500/20 text-green-300 border border-green-500/30">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-white/10 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(aiSkillGapAnalysis.gap_insights || []).length > 0 ? (
                      <div className="space-y-2">
                        {aiSkillGapAnalysis.gap_insights!.map((insight, i) => (
                          <div key={`ins-${i}`} className="text-gray-300">
                            - {insight}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400">No insights provided.</div>
                    )}

                    {aiSkillGapAnalysis.next_best_skill && (
                      <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="text-sm font-semibold text-white mb-2">Next Best Skill</div>
                        <div className="text-white font-medium">{aiSkillGapAnalysis.next_best_skill.skill}</div>
                        <div className="text-sm text-gray-300 mt-1">{aiSkillGapAnalysis.next_best_skill.reason}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Estimated effort: {aiSkillGapAnalysis.next_best_skill.estimated_effort}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Overall Match */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Overall Match: {calculateOverallMatch()}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar value={calculateOverallMatch()} className="h-3" />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {getSkillsByStatus('match').length}
                    </div>
                    <div className="text-sm text-gray-400">Matched</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {getSkillsByStatus('partial').length}
                    </div>
                    <div className="text-sm text-gray-400">Partial</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {getSkillsByStatus('missing').length}
                    </div>
                    <div className="text-sm text-gray-400">Missing</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Breakdown */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Matched Skills */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Matched Skills ({getSkillsByStatus('match').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSkillsByStatus('match').map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {skill.skill}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">
                          {getSkillLevelLabel(skill.current)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Partial Skills */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Partial Match ({getSkillsByStatus('partial').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSkillsByStatus('partial').map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {skill.skill}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-400">
                            {getSkillLevelLabel(skill.current)}/{getSkillLevelLabel(skill.required)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(skill.current / skill.required) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Missing Skills */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-400" />
                    Missing Skills ({getSkillsByStatus('missing').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSkillsByStatus('missing').map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            {skill.skill}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">
                          Need: {getSkillLevelLabel(skill.required)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/roadmap">
                  Get Personalized Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
