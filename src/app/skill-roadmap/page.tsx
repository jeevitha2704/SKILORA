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
  Map,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Zap,
  Award,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Calendar,
  Briefcase,
  Brain,
  Rocket,
  Star,
  Lock,
  Unlock,
  Mountain,
  Flag
} from 'lucide-react'

interface RoadmapPhase {
  id: string
  name: string
  icon: any
  color: string
  description: string
  duration: string
  weeks: number
  skills: RoadmapSkill[]
  importance: 'foundation' | 'core' | 'advanced' | 'optional'
}

interface RoadmapSkill {
  id: string
  name: string
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced'
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  priority: 'High' | 'Medium' | 'Low'
  jobRelevance: number // 0-100
  estimatedHours: number
  prerequisites: string[]
  resources: string[]
  projectIdea: string
  completed: boolean
  progress: number
}

interface RoadmapData {
  targetRole: string
  currentReadiness: number
  targetReadiness: number
  estimatedWeeks: number
  phases: RoadmapPhase[]
  skillProgression: RoadmapSkill[]
  timeline: TimelineItem[]
  milestones: Milestone[]
  nextSteps: string[]
}

interface TimelineItem {
  week: string
  activities: string[]
  skills: string[]
}

interface Milestone {
  id: string
  title: string
  description: string
  skills: string[]
  resumeUpdate: string
  completed: boolean
}

export default function SkillRoadmapPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-1')
  const [completedSkills, setCompletedSkills] = useState<string[]>([])
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])

  useEffect(() => {
    // Load completed skills and milestones from localStorage
    const saved = localStorage.getItem('completedSkills')
    const savedMilestones = localStorage.getItem('completedMilestones')
    if (saved) setCompletedSkills(JSON.parse(saved))
    if (savedMilestones) setCompletedMilestones(JSON.parse(savedMilestones))

    // Generate roadmap from analyzed job data
    generateRoadmap()
    setLoading(false)
  }, [])

  const generateRoadmap = () => {
    // Get analyzed job data from localStorage
    const analyzedJobData = localStorage.getItem('analyzedJobForRoadmap')
    
    if (!analyzedJobData) {
      // Show default if no job analyzed
      setRoadmapData(null)
      return
    }

    const jobData = JSON.parse(analyzedJobData)
    const targetRole = jobData.jobTitle || 'Professional'
    
    let highPrioritySkills: string[] = []
    let mediumPrioritySkills: string[] = []
    let lowPrioritySkills: string[] = []
    const skillGapData = jobData.skillGapData || []
    
    // Extract priority skills from AI analysis
    if (jobData.skillGapAnalysis?.priority_classification) {
      const priorities = jobData.skillGapAnalysis.priority_classification
      highPrioritySkills = priorities.high_priority || []
      mediumPrioritySkills = priorities.medium_priority || []
      lowPrioritySkills = priorities.low_priority || []
    }

    // Calculate current and target readiness based on skill gap
    let matchedCount = 0
    let partialCount = 0
    let missingCount = 0
    
    skillGapData.forEach((skill: any) => {
      if (skill.status === 'match') matchedCount++
      else if (skill.status === 'partial') partialCount++
      else if (skill.status === 'missing') missingCount++
    })
    
    const totalSkills = skillGapData.length || 1
    const currentReadiness = Math.round(((matchedCount + partialCount * 0.5) / totalSkills) * 100)
    const targetReadiness = 90
    
    // Estimate weeks based on number of missing skills
    const estimatedWeeks = Math.max(8, Math.min(24, Math.ceil((missingCount * 1.5))))

    // Determine job family for customization
    const getJobFamily = (jobTitle: string): string => {
      const title = jobTitle.toLowerCase()
      if (title.includes('devops') || title.includes('dev ops') || title.includes('infrastructure')) {
        return 'devops'
      } else if (title.includes('data') || title.includes('analyst') || title.includes('bi')) {
        return 'dataanalyst'
      } else if (title.includes('frontend') || title.includes('front-end') || title.includes('react') || title.includes('ui')) {
        return 'frontend'
      } else if (title.includes('backend') || title.includes('back-end') || title.includes('api') || title.includes('server')) {
        return 'backend'
      } else if (title.includes('full') || title.includes('fullstack')) {
        return 'fullstack'
      } else if (title.includes('cloud') || title.includes('aws') || title.includes('azure') || title.includes('gcp')) {
        return 'cloud'
      } else if (title.includes('security') || title.includes('infosec')) {
        return 'security'
      } else if (title.includes('machine') || title.includes('ml') || title.includes('ai')) {
        return 'ml'
      }
      return 'generic'
    }

    const jobFamily = getJobFamily(targetRole)

    // Define job-specific phase templates
    const getPhaseTemplate = (jobFamily: string, phaseIndex: number) => {
      const templates: Record<string, Array<{ name: string; description: string; duration: string }>> = {
        devops: [
          { name: 'Linux & Infrastructure Fundamentals 🖥️', description: 'Master OS basics and infrastructure foundations', duration: '2–3 weeks' },
          { name: 'Containerization & Orchestration 🐳', description: 'Docker, Kubernetes, and container orchestration', duration: '3–4 weeks' },
          { name: 'CI/CD & Automation 🔄', description: 'Jenkins, GitLab CI, automated pipelines, and deployment', duration: '2–3 weeks' },
          { name: 'Cloud Platforms & Monitoring ☁️', description: 'AWS/Azure, logging, monitoring, and incident response', duration: '2–3 weeks' }
        ],
        dataanalyst: [
          { name: 'SQL & Data Foundations 📊', description: 'SQL queries, database design, and data extraction', duration: '2–3 weeks' },
          { name: 'Python & Data Analysis 🐍', description: 'Python, Pandas, NumPy, and statistical analysis', duration: '3–4 weeks' },
          { name: 'Visualization & Business Intelligence 📈', description: 'Tableau, Power BI, dashboards, and storytelling', duration: '2–3 weeks' },
          { name: 'Advanced Analytics & Modeling 🔮', description: 'Regression, forecasting, machine learning basics', duration: '2–3 weeks' }
        ],
        frontend: [
          { name: 'HTML, CSS & JavaScript Fundamentals 🎨', description: 'Semantic HTML, CSS layouts, JS fundamentals', duration: '2–3 weeks' },
          { name: 'React & Component Architecture ⚛️', description: 'React hooks, state management, component design patterns', duration: '3–4 weeks' },
          { name: 'Advanced Styling & Responsive Design 📱', description: 'Tailwind CSS, mobile-first design, animations', duration: '2–3 weeks' },
          { name: 'Testing & Performance Optimization 🚀', description: 'Unit testing, E2E testing, web performance', duration: '2–3 weeks' }
        ],
        backend: [
          { name: 'APIs & Server Fundamentals 🔌', description: 'REST APIs, HTTP, server architecture, Node.js/Python basics', duration: '2–3 weeks' },
          { name: 'Databases & Data Models 🗄️', description: 'SQL/NoSQL, schema design, queries, indexing', duration: '3–4 weeks' },
          { name: 'System Design & Architecture 🏗️', description: 'Microservices, scaling, caching, load balancing', duration: '2–3 weeks' },
          { name: 'Security & Performance 🔒', description: 'Authentication, encryption, optimization, monitoring', duration: '2–3 weeks' }
        ],
        fullstack: [
          { name: 'Frontend Fundamentals & Framework 🎨', description: 'HTML/CSS/JS and modern framework (React/Vue)', duration: '2–3 weeks' },
          { name: 'Backend & Database Essentials 🗄️', description: 'Server setup, APIs, databases, authentication', duration: '3–4 weeks' },
          { name: 'Integration & Deployment 🚀', description: 'Full-stack projects, CI/CD, cloud deployment', duration: '2–3 weeks' },
          { name: 'Advanced Patterns & Optimization ⚡', description: 'Performance, security, testing, architecture patterns', duration: '2–3 weeks' }
        ],
        cloud: [
          { name: 'Cloud Fundamentals 📡', description: 'Cloud concepts, services, pricing, and core AWS/Azure services', duration: '2–3 weeks' },
          { name: 'Infrastructure as Code & Automation 🔧', description: 'Terraform, CloudFormation, automation, and orchestration', duration: '3–4 weeks' },
          { name: 'Networking & Security 🔐', description: 'VPCs, security groups, IAM, data protection', duration: '2–3 weeks' },
          { name: 'Advanced Cloud Architecture 🏛️', description: 'High availability, disaster recovery, optimization', duration: '2–3 weeks' }
        ],
        security: [
          { name: 'Security Fundamentals 🛡️', description: 'OWASP, cryptography, authentication, and authorization', duration: '2–3 weeks' },
          { name: 'Network & System Security 🔗', description: 'Network protocols, firewalls, penetration testing basics', duration: '3–4 weeks' },
          { name: 'Application Security & Compliance 📋', description: 'Secure coding, vulnerability management, compliance', duration: '2–3 weeks' },
          { name: 'Incident Response & Forensics 🚨', description: 'Incident handling, forensics, threat analysis', duration: '2–3 weeks' }
        ],
        ml: [
          { name: 'Python & Mathematics Foundation 📐', description: 'Python, NumPy, Pandas, linear algebra, statistics', duration: '2–3 weeks' },
          { name: 'Machine Learning Algorithms 🤖', description: 'Supervised learning, unsupervised learning, model selection', duration: '3–4 weeks' },
          { name: 'Deep Learning & Neural Networks 🧠', description: 'Neural networks, TensorFlow, PyTorch, computer vision', duration: '2–3 weeks' },
          { name: 'MLOps & Deployment 📦', description: 'Model serving, pipelines, monitoring, production deployment', duration: '2–3 weeks' }
        ],
        generic: [
          { name: 'Foundation Skills 🧱', description: 'Essential skills needed for your role', duration: '2–3 weeks' },
          { name: 'Core Job Skills ⚙️', description: 'Applied skills directly used in your position', duration: '3–4 weeks' },
          { name: 'Advanced & Specialization 🚀', description: 'Advanced techniques and specializations', duration: '2–3 weeks' },
          { name: 'Optional & Differentiators ✨', description: 'Nice-to-have skills that add competitive advantage', duration: '1–2 weeks' }
        ]
      }

      return templates[jobFamily]?.[phaseIndex] || templates.generic[phaseIndex]
    }

    // Create dynamic phases based on actual job skills
    const createPhases = (): RoadmapPhase[] => {
      const phases: RoadmapPhase[] = []
      const phaseColors = [
        'from-orange-500 to-red-600',
        'from-blue-500 to-cyan-600',
        'from-purple-500 to-pink-600',
        'from-yellow-500 to-orange-600'
      ]
      const phaseIcons = [Mountain, Zap, Rocket, Star]
      const phaseImportance: Array<'foundation' | 'core' | 'advanced' | 'optional'> = ['foundation', 'core', 'advanced', 'optional']

      // Distribute skills across 4 phases
      const skillLists = [highPrioritySkills, mediumPrioritySkills, lowPrioritySkills, []]
      let skillIndex = 0

      for (let phaseIdx = 0; phaseIdx < 4; phaseIdx++) {
        const template = getPhaseTemplate(jobFamily, phaseIdx)
        const phaseSkillList = skillLists[phaseIdx].slice(0, phaseIdx === 0 ? 4 : phaseIdx === 1 ? 3 : 3)
        
        if (phaseSkillList.length > 0 || phaseIdx < 2) {
          phases.push({
            id: `phase-${phaseIdx + 1}`,
            name: template.name,
            icon: phaseIcons[phaseIdx],
            color: phaseColors[phaseIdx],
            description: template.description,
            duration: template.duration,
            weeks: phaseIdx === 0 ? 3 : phaseIdx === 1 ? 4 : phaseIdx === 2 ? 3 : 2,
            importance: phaseImportance[phaseIdx],
            skills: phaseSkillList.map((skill, idx) => ({
              id: `skill-${skillIndex + idx + 1}`,
              name: skill,
              currentLevel: phaseIdx === 0 ? 'Beginner' : 'None',
              targetLevel: phaseIdx === 0 ? 'Intermediate' : phaseIdx === 1 ? 'Advanced' : 'Intermediate',
              priority: phaseIdx === 0 ? 'High' : phaseIdx === 1 ? 'High' : phaseIdx === 2 ? 'Medium' : 'Low',
              jobRelevance: Math.max(50, 95 - phaseIdx * 15 - idx * 5),
              estimatedHours: phaseIdx === 0 ? 40 - idx * 5 : phaseIdx === 1 ? 45 - idx * 5 : 40 - idx * 5,
              prerequisites: phaseIdx > 0 && highPrioritySkills.length > 0 ? [highPrioritySkills[0]] : [],
              resources: [
                `${skill} Official Documentation`,
                `${skill} Tutorial & Courses`,
                `Hands-on practice projects`
              ],
              projectIdea: `Build a project using ${skill}`,
              completed: false,
              progress: 0
            }))
          })
          skillIndex += phaseSkillList.length
        }
      }

      return phases
    }

    const phases = createPhases()
    const allSkills = phases.flatMap(phase => phase.skills)

    // Create timeline based on phases
    const timeline: TimelineItem[] = [
      {
        week: 'Week 1–2',
        activities: [
          `Master ${highPrioritySkills[0] || 'foundation skill'} fundamentals`,
          `Learn ${highPrioritySkills[1] || 'second priority skill'}`
        ],
        skills: highPrioritySkills.slice(0, 2)
      },
      {
        week: 'Week 3–5',
        activities: [
          `Apply ${highPrioritySkills[0] || 'foundation skill'} in practice`,
          `Master ${mediumPrioritySkills[0] || 'core skill'}`,
          'Build real-world projects'
        ],
        skills: mediumPrioritySkills.slice(0, 2)
      },
      {
        week: 'Week 6–8',
        activities: [
          `Advanced training in ${mediumPrioritySkills[0] || 'core skill'}`,
          'Build comprehensive portfolio projects',
          'Contribute to open source'
        ],
        skills: ['Advanced projects', 'Portfolio building']
      },
      {
        week: 'Week 9+',
        activities: [
          'System design and architecture',
          'Performance optimization',
          'Interview preparation',
          'Resume updates'
        ],
        skills: ['Full stack mastery']
      }
    ]

    // Create milestones based on phases
    const milestones: Milestone[] = []
    phases.forEach((phase, phaseIdx) => {
      phase.skills.slice(0, 2).forEach((skill, skillIdx) => {
        milestones.push({
          id: `milestone-${phaseIdx}-${skillIdx}`,
          title: `Master ${skill.name}`,
          description: `Become proficient in ${skill.name} for ${targetRole} role`,
          skills: [skill.name],
          resumeUpdate: `Add "${skill.name}" to your professional experience or skills section`,
          completed: false
        })
      })
    })

    // Create next steps based on job requirements
    const nextSteps: string[] = [
      `Start with ${highPrioritySkills[0] || 'the most critical skill'} - essential for this role`,
      `Simultaneously learn ${highPrioritySkills[1] || 'secondary skill'} - highest job relevance`,
      `Focus on ${mediumPrioritySkills[0] || 'core practical skills'} for hands-on work`,
      'Build portfolio projects that demonstrate these skills',
      `Apply for ${targetRole} positions once you complete Phase 2`,
      'Continue with advanced skills to stand out from competition'
    ]

    // Create final roadmap object
    const roadmap: RoadmapData = {
      targetRole,
      currentReadiness,
      targetReadiness,
      estimatedWeeks,
      phases,
      skillProgression: allSkills,
      timeline,
      milestones,
      nextSteps
    }

    setRoadmapData(roadmap)
  }

  const handleSkillCompletion = (skillId: string) => {
    const updated = completedSkills.includes(skillId)
      ? completedSkills.filter(id => id !== skillId)
      : [...completedSkills, skillId]
    setCompletedSkills(updated)
    localStorage.setItem('completedSkills', JSON.stringify(updated))
  }

  const handleMilestoneCompletion = (milestoneId: string) => {
    const updated = completedMilestones.includes(milestoneId)
      ? completedMilestones.filter(id => id !== milestoneId)
      : [...completedMilestones, milestoneId]
    setCompletedMilestones(updated)
    localStorage.setItem('completedMilestones', JSON.stringify(updated))
  }

  const calculateProgress = () => {
    if (!roadmapData) return 0
    const total = roadmapData.skillProgression.length
    return total > 0 ? Math.round((completedSkills.length / total) * 100) : 0
  }

  const calculateNewReadiness = () => {
    if (!roadmapData) return 0
    const skillsCompleted = completedSkills.length
    const totalSkills = roadmapData.skillProgression.length
    if (totalSkills === 0) return roadmapData.currentReadiness
    
    const increase = ((skillsCompleted / totalSkills) * (roadmapData.targetReadiness - roadmapData.currentReadiness))
    return Math.round(roadmapData.currentReadiness + increase)
  }

  if (loading || !roadmapData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-gray-400">Generating your personalized skill roadmap...</p>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const newReadiness = calculateNewReadiness()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30 mb-4">
            <Map className="h-4 w-4 mr-2" />
            Personalized Learning Path
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2 font-space-grotesk">
            Your Skill Roadmap 🗺️
          </h1>
          <p className="text-gray-400 text-lg">
            Clear steps to bridge your skill gaps and land your dream role
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Target Role */}
          <Card className="glass hover-lift border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">Target</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Target Role</p>
              <p className="text-2xl font-bold text-white">{roadmapData.targetRole}</p>
            </CardContent>
          </Card>

          {/* Current Readiness */}
          <Card className="glass hover-lift border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="text-xs">Current</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-2">Current Readiness</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{roadmapData.currentReadiness}%</p>
                <ArrowRight className="h-4 w-4 text-gray-500" />
                <p className="text-xl font-semibold text-primary">{newReadiness}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Target Readiness */}
          <Card className="glass hover-lift border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-success" />
                <Badge variant="outline" className="text-xs">Goal</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Target Readiness</p>
              <p className="text-2xl font-bold text-white">{roadmapData.targetReadiness}%</p>
            </CardContent>
          </Card>

          {/* Estimated Time */}
          <Card className="glass hover-lift border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <Badge variant="outline" className="text-xs">Timeline</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Estimated Duration</p>
              <p className="text-2xl font-bold text-white">{roadmapData.estimatedWeeks} weeks</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="glass border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Your Learning Progress</h3>
                <p className="text-gray-400 text-sm">{completedSkills.length} of {roadmapData.skillProgression.length} skills completed</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{progress}%</p>
                <p className="text-xs text-gray-400">to job readiness</p>
              </div>
            </div>
            <ProgressBar value={progress} className="h-2" />
            <p className="text-xs text-gray-400 mt-2">Complete more skills to increase your job readiness from {roadmapData.currentReadiness}% to {newReadiness}%</p>
          </CardContent>
        </Card>

        {/* Learning Phases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Learning Phases</h2>
          <div className="space-y-4">
            {roadmapData.phases.map((phase) => {
              const phaseSkills = phase.skills
              const completedPhaseSkills = phaseSkills.filter(s => completedSkills.includes(s.id)).length
              const phaseProgress = Math.round((completedPhaseSkills / phaseSkills.length) * 100)
              const isExpanded = expandedPhase === phase.id

              return (
                <Card key={phase.id} className={`glass border-white/10 overflow-hidden cursor-pointer hover-lift transition-all ${
                  isExpanded ? 'ring-2 ring-primary/50' : ''
                }`}>
                  <div className={`h-1 bg-gradient-to-r ${phase.color}`} />
                  
                  <div 
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${phase.color} bg-opacity-20`}>
                            <phase.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{phase.name}</h3>
                            <p className="text-sm text-gray-400">{phase.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mb-2 ${
                          phaseProgress === 100 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                        }`}>
                          {completedPhaseSkills}/{phaseSkills.length} skills
                        </Badge>
                        <div className="text-sm text-gray-400 flex items-center justify-end gap-1">
                          <Clock className="h-4 w-4" />
                          {phase.duration}
                        </div>
                      </div>
                    </div>

                    {/* Phase Progress Bar */}
                    <div className="mt-4">
                      <ProgressBar value={phaseProgress} className="h-1.5" />
                      <p className="text-xs text-gray-400 mt-2">{phaseProgress}% complete</p>
                    </div>
                  </div>

                  {/* Expanded Skills List */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-6 pt-6 space-y-4">
                      {phase.skills.map((skill) => {
                        const isCompleted = completedSkills.includes(skill.id)
                        
                        return (
                          <div 
                            key={skill.id}
                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                              isCompleted 
                                ? 'border-success/50 bg-success/10' 
                                : 'border-white/20 bg-background/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                            onClick={() => handleSkillCompletion(skill.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <h4 className={`font-semibold ${isCompleted ? 'text-success line-through' : 'text-white'}`}>
                                    {skill.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-white/5">
                                      {skill.currentLevel} → {skill.targetLevel}
                                    </Badge>
                                    <Badge className={`text-xs ${
                                      skill.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                      skill.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {skill.priority} Priority
                                    </Badge>
                                    <Badge className="text-xs bg-white/5">
                                      {skill.jobRelevance}% Relevant
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-400">{skill.estimatedHours}h</div>
                                <div className="text-xs text-gray-500">estimated</div>
                              </div>
                            </div>

                            {/* Skill Details */}
                            <div className="space-y-3 text-sm">
                              {skill.prerequisites.length > 0 && (
                                <div>
                                  <p className="text-gray-400 mb-1 flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Prerequisites:
                                  </p>
                                  <p className="text-gray-300">{skill.prerequisites.join(', ')}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-gray-400 mb-1 flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Learning Resources:
                                </p>
                                <ul className="text-gray-300 space-y-1">
                                  {skill.resources.map((resource, idx) => (
                                    <li key={idx}>• {resource}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <p className="text-gray-400 mb-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Project Idea:
                                </p>
                                <p className="text-gray-300">{skill.projectIdea}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Skill Progression Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Skill Progression Overview</h2>
          <Card className="glass border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-semibold">Skill</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Current</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Target</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Priority</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Job Relevance</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmapData.skillProgression.map((skill) => {
                    const isCompleted = completedSkills.includes(skill.id)
                    return (
                      <tr key={skill.id} className={`border-b border-white/10 hover:bg-white/5 ${isCompleted ? 'bg-success/5' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-success" />}
                            <span className={isCompleted ? 'line-through text-gray-500' : 'text-white'}>{skill.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{skill.currentLevel}</td>
                        <td className="p-4 text-white font-semibold">{skill.targetLevel}</td>
                        <td className="p-4">
                          <Badge className={`text-xs ${
                            skill.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                            skill.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {skill.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={skill.jobRelevance} className="w-16 h-1.5" />
                            <span className="text-gray-400 text-xs">{skill.jobRelevance}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={isCompleted ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'}>
                            {isCompleted ? '✓ Completed' : 'Not Started'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Learning Timeline ⏳</h2>
          <div className="space-y-3">
            {roadmapData.timeline.map((item, idx) => (
              <Card key={idx} className="glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Badge className="bg-primary/20 text-primary">{item.week}</Badge>
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-2">
                        {item.activities.map((activity, actIdx) => (
                          <li key={actIdx} className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Resume Improvement Milestones 🏆</h2>
          <div className="space-y-3">
            {roadmapData.milestones.map((milestone) => {
              const isCompleted = completedMilestones.includes(milestone.id)
              
              return (
                <Card 
                  key={milestone.id}
                  className={`glass border-white/10 cursor-pointer hover-lift transition-all ${
                    isCompleted ? 'ring-2 ring-success/50' : ''
                  }`}
                  onClick={() => handleMilestoneCompletion(milestone.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Flag className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-success line-through' : 'text-white'}`}>
                          {milestone.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                        <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                          <p className="text-sm font-semibold text-yellow-400 mb-1">📄 Resume Update:</p>
                          <p className="text-sm text-gray-300">{milestone.resumeUpdate}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Skills: {milestone.skills.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Smart Recommendations 🧠</h2>
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <ul className="space-y-3">
                {roadmapData.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Final Outcome Panel */}
        <div className="mb-8">
          <Card className="glass bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You're On Track! 🚀</h3>
              <p className="text-gray-300 mb-4">
                By completing this roadmap, you'll be <span className="font-semibold text-primary">{newReadiness}%</span> ready for your target role.
              </p>
              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <p>✅ Updated skills on your resume</p>
                <p>✅ Portfolio projects to showcase</p>
                <p>✅ Interview-ready expertise</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Rocket className="h-4 w-4" />
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center mb-8">
          <Link href="/skill-gap">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Skill Gap
            </Button>
          </Link>
          <Link href="/courses">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
