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

export default function SkillGap() {
  const { user } = useAuth()
  const router = useRouter()
  const [userSkills, setUserSkills] = useState<any[]>([])
  const [jobAnalyses, setJobAnalyses] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [skillComparisons, setSkillComparisons] = useState<SkillComparison[]>([])
  const [skillGapData, setSkillGapData] = useState<SkillGapData[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<'job' | 'general'>('general')

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

  const analyzeGeneralSkills = () => {
    console.log('Analyzing general skills...')
    console.log('User skills:', userSkills)
    
    // Add sample skills for testing if no skills exist
    if (userSkills.length === 0) {
      console.log('No user skills found, adding sample skills for testing')
      const sampleSkills = [
        { name: 'JavaScript', level: 'intermediate', category: 'technical' },
        { name: 'React', level: 'advanced', category: 'technical' },
        { name: 'Communication', level: 'expert', category: 'soft' },
        { name: 'Project Management', level: 'intermediate', category: 'soft' }
      ]
      
      const generalGapData: SkillGapData[] = sampleSkills.map((skill) => ({
        skill: skill.name,
        required: 100,
        current: getSkillLevelValue(skill.level),
        status: getSkillStatus(skill.level),
        category: skill.category,
        gapPercentage: Math.max(0, 100 - getSkillLevelValue(skill.level))
      }))
      
      console.log('Generated sample gap data:', generalGapData)
      setSkillGapData(generalGapData)
      return
    }
    
    setAnalyzing(true)
    try {
      // Generate skill gap data based on user skills alone
      const generalGapData: SkillGapData[] = userSkills.map((skill: any) => ({
        skill: skill.name,
        required: 100, // Assume full proficiency as goal
        current: getSkillLevelValue(skill.level),
        status: getSkillStatus(skill.level),
        category: skill.category,
        gapPercentage: Math.max(0, 100 - getSkillLevelValue(skill.level))
      }))
      
      console.log('Generated gap data:', generalGapData)
      setSkillGapData(generalGapData)
    } catch (error) {
      console.error('Error analyzing general skills:', error)
    } finally {
      setAnalyzing(false)
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

  const getSkillStatus = (level: string): 'match' | 'partial' | 'missing' => {
    const value = getSkillLevelValue(level)
    if (value >= 80) return 'match'
    if (value >= 50) return 'partial'
    return 'missing'
  }

  const analyzeSkillGap = async () => {
    if (!selectedJob) return

    setAnalyzing(true)
    try {
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
          
          {/* Analysis Mode Selection */}
          <div className="inline-flex rounded-lg bg-white/10 p-1 mb-6">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                analysisMode === 'general'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setAnalysisMode('general')}
            >
              General Skills
            </button>
            {jobAnalyses.length > 0 && (
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  analysisMode === 'job'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setAnalysisMode('job')}
              >
                Job-Based
              </button>
            )}
          </div>
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
                  className="bg-primary hover:bg-primary/90"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Skill Gap'}
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Skills Analysis */}
        {analysisMode === 'general' && (
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Your Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userSkills.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{userSkills.length}</div>
                      <div className="text-sm text-gray-400">Total Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {userSkills.filter((s: any) => s.level === 'expert').length}
                      </div>
                      <div className="text-sm text-gray-400">Expert</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {userSkills.filter((s: any) => s.level === 'advanced').length}
                      </div>
                      <div className="text-sm text-gray-400">Advanced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {userSkills.filter((s: any) => s.level === 'intermediate').length}
                      </div>
                      <div className="text-sm text-gray-400">Intermediate</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button 
                      onClick={analyzeGeneralSkills}
                      disabled={analyzing}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze Skill Gaps'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    No skills in your profile. Adding sample skills for demonstration...
                  </p>
                  <Button 
                    onClick={analyzeGeneralSkills}
                    disabled={analyzing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {analyzing ? 'Analyzing...' : 'Try Sample Analysis'}
                  </Button>
                </div>
              )}
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
                <Link href={analysisMode === 'general' ? '/profile' : '/analyzer'}>
                  {analysisMode === 'general' ? 'Build Your Profile' : 'Analyze a Job'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Skill Gap Results */}
        {skillGapData.length > 0 && (
          <div className="space-y-8">
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
