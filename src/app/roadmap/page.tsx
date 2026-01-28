'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  Map,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code2,
  Trophy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  Briefcase,
  GraduationCap,
  Zap,
  ArrowRight
} from 'lucide-react'

interface CourseSession {
  id: string
  milestoneId: string
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  startTime?: Date
  endTime?: Date
  userAnswer?: number
  title: string
  content: string
  topics: string[]
  quiz?: {
    question: string
    options: string[]
    correctAnswer: number
  }
}

interface Milestone {
  id: string
  title: string
  description: string
  duration: string
  status: 'completed' | 'in-progress' | 'upcoming'
  type: 'course' | 'project' | 'practice'
  resources: { name: string; url: string; type: string }[]
  skills: string[]
  sessions?: CourseSession[]
}

const generateCourseSessions= (milestone: Milestone): CourseSession[] => {
  if (milestone.type !== 'course') return []
  
  const totalSteps = 7 + Math.floor(Math.random() * 2) // 7-8 steps per course
  
  if (milestone.title === "TypeScript Fundamentals") {
    return [
      {
        id: `${milestone.id}-session-1`,
        milestoneId: milestone.id,
        currentStep: 1,
        totalSteps,
        isCompleted: milestone.status === 'completed', // Mark as completed if milestone is completed
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "TypeScript Basics & Types",
        content: "Learn the fundamentals of TypeScript including basic types, interfaces, and type annotations. Understand why TypeScript is essential for modern JavaScript development.",
        topics: ["What is TypeScript", "Basic Types", "Type Annotations", "Type Inference"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-2`,
        milestoneId: milestone.id,
        currentStep: 2,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "Interfaces & Type Aliases",
        content: "Master TypeScript interfaces and type aliases for creating reusable type definitions. Learn how to structure your data models effectively.",
        topics: ["Interface Syntax", "Type Aliases", "Reusable Types", "Best Practices"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-3`,
        milestoneId: milestone.id,
        currentStep: 3,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "Generics & Advanced Types",
        content: "Dive deep into TypeScript generics for creating flexible and reusable type definitions. Master advanced typing concepts.",
        topics: ["Generic Functions", "Generic Classes", "Type Constraints", "Utility Types"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-4`,
        milestoneId: milestone.id,
        currentStep: 4,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "Type Safety & Error Handling",
        content: "Learn how TypeScript prevents runtime errors and provides better development experience with type checking.",
        topics: ["Type Safety", "Error Prevention", "Type Guards", "Assertion Functions"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-5`,
        milestoneId: milestone.id,
        currentStep: 5,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "Modules & Namespaces",
        content: "Understand TypeScript modules and namespaces for organizing large codebases and managing dependencies.",
        topics: ["Import/Export", "Module Systems", "Namespaces", "Code Organization"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-6`,
        milestoneId: milestone.id,
        currentStep: 6,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "Decorators & Metadata",
        content: "Explore TypeScript decorators and metadata for adding annotations and modifying class behavior.",
        topics: ["Decorator Basics", "Class Decorators", "Method Decorators", "Property Decorators"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-${totalSteps}`,
        milestoneId: milestone.id,
        currentStep: totalSteps,
        totalSteps,
        isCompleted: milestone.status === 'completed',
        startTime: undefined,
        endTime: milestone.status === 'completed' ? new Date() : undefined,
        userAnswer: undefined,
        title: "TypeScript Best Practices & Project Setup",
        content: "Put it all together with TypeScript best practices and real-world project setup for production applications.",
        topics: ["Project Configuration", "Build Tools", "Testing with TypeScript", "Production Deployment"],
        quiz: {
          question: "What's the most important TypeScript concept for building scalable applications?",
          options: [
            "Type safety and error prevention",
            "Interface and type definitions",
            "Generic programming patterns",
            "All concepts are equally important"
          ],
          correctAnswer: 3,
        }
      }
    ]
  }

  if (milestone.title === "Advanced React Patterns") {
    return [
      {
        id: `${milestone.id}-session-1`,
        milestoneId: milestone.id,
        currentStep: 1,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Introduction to React Patterns",
        content: "Learn the fundamentals of React patterns and why they're important for building scalable applications. Understand the core principles that guide modern React development.",
        topics: ["What are React Patterns", "Why Patterns Matter", "Pattern Categories", "Best Practices"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-2`,
        milestoneId: milestone.id,
        currentStep: 2,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Compound Components",
        content: "Master the compound component pattern for creating flexible and composable UI components. Learn how to build components that work together seamlessly.",
        topics: ["Component Composition", "Compound Component API", "Context Integration", "Real-world Examples"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-3`,
        milestoneId: milestone.id,
        currentStep: 3,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Render Props Pattern",
        content: "Explore the render props pattern for sharing component logic and creating highly reusable components. Understand when and how to use render props effectively.",
        topics: ["Render Props Basics", "Function as Children", "Advanced Render Props", "Common Pitfalls"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-4`,
        milestoneId: milestone.id,
        currentStep: 4,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Custom Hooks",
        content: "Dive deep into custom hooks for extracting and sharing component logic. Learn to build your own hooks for complex state management and side effects.",
        topics: ["Hook Rules", "Custom Hook Creation", "State Management", "Performance Optimization"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-5`,
        milestoneId: milestone.id,
        currentStep: 5,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "State Management Patterns",
        content: "Learn advanced state management patterns including useReducer, context patterns, and third-party state management solutions.",
        topics: ["useReducer Pattern", "Context Optimization", "State Reducers", "Performance Considerations"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-6`,
        milestoneId: milestone.id,
        currentStep: 6,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Performance Optimization",
        content: "Master React performance optimization techniques including memoization, code splitting, and lazy loading for optimal user experience.",
        topics: ["React.memo", "useMemo & useCallback", "Code Splitting", "Lazy Loading"],
        quiz: undefined
      },
      {
        id: `${milestone.id}-session-${totalSteps}`,
        milestoneId: milestone.id,
        currentStep: totalSteps,
        totalSteps,
        isCompleted: false,
        startTime: undefined,
        endTime: undefined,
        userAnswer: undefined,
        title: "Advanced Patterns & Best Practices",
        content: "Put it all together with advanced patterns and industry best practices for building production-ready React applications.",
        topics: ["Error Boundaries", "Suspense Patterns", "Server Components", "Production Deployment"],
        quiz: {
          question: "What's the most important concept you learned about React patterns?",
          options: [
            "Component composition and reusability",
            "Performance optimization techniques", 
            "State management strategies",
            "All of the above are equally important"
          ],
          correctAnswer: 3,
        }
      }
    ]
  }
  
  // Default course content for other courses
  return Array.from({ length: totalSteps }, (_, index) => ({
    id: `${milestone.id}-session-${index + 1}`,
    milestoneId: milestone.id,
    currentStep: index + 1,
    totalSteps,
    isCompleted: false,
    startTime: index === 0 ? new Date() : undefined,
    endTime: undefined,
    userAnswer: undefined,
    title: `Step ${index + 1}: ${milestone.title} Basics`,
    content: `Learn the fundamentals of ${milestone.title} in this comprehensive step.`,
    topics: ["Introduction", "Core Concepts", "Practical Examples", "Exercises"],
    quiz: index === totalSteps - 1 ? {
      question: `What's the most important concept you learned in ${milestone.title}?`,
      options: [
        'Core fundamentals',
        'Practical applications',
        'Advanced techniques',
        'Best practices'
      ],
      correctAnswer: Math.floor(Math.random() * 4),
    } : undefined
  }))

}

const sampleRoadmapData: Milestone[] = [
  {
    id: "1",
    title: "TypeScript Fundamentals",
    description: "Master TypeScript basics including types, interfaces, generics, and advanced typing concepts. Build a strong foundation for type-safe JavaScript development.",
    duration: "1 week",
    status: "completed",
    type: "course",
    skills: ["TypeScript"],
    resources: [
      { name: "TypeScript Handbook", url: "#", type: "Documentation" },
      { name: "Total TypeScript - Beginner", url: "#", type: "Course" },
      { name: "TypeScript Exercises", url: "#", type: "Practice" },
    ],
    sessions: generateCourseSessions({
      id: "1",
      title: "TypeScript Fundamentals",
      description: "Master TypeScript basics including types, interfaces, generics, and advanced typing concepts. Build a strong foundation for type-safe JavaScript development.",
      duration: "1 week",
      status: "completed" as const,
      type: "course" as const,
      resources: [],
      skills: []
    })
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Learn compound components, render props, custom hooks, and advanced React patterns. Build scalable and maintainable React applications.",
    duration: "2 weeks",
    status: "in-progress",
    type: "course",
    skills: ["React", "TypeScript"],
    resources: [
      { name: "Advanced React Patterns", url: "#", type: "Course" },
      { name: "React TypeScript Cheatsheet", url: "#", type: "Documentation" },
      { name: "React Patterns Repository", url: "#", type: "Examples" },
    ],
    sessions: generateCourseSessions({
      id: "2",
      title: "Advanced React Patterns",
      description: "Learn compound components, render props, custom hooks, and advanced React patterns. Build scalable and maintainable React applications.",
      duration: "2 weeks",
      status: "in-progress" as const,
      type: "course" as const,
      resources: [],
      skills: []
    })
  },
  {
    id: "3",
    title: "Node.js & Express Backend",
    description: "Build RESTful APIs with Node.js and Express. Learn authentication, middleware, error handling, and database integration.",
    duration: "2 weeks",
    status: "upcoming",
    type: "course",
    skills: ["Node.js", "Express", "REST APIs"],
    resources: [
      { name: "Node.js Official Docs", url: "#", type: "Documentation" },
      { name: "Express.js Guide", url: "#", type: "Tutorial" },
      { name: "Building REST APIs", url: "#", type: "Course" },
    ],
  },
  {
    id: "4",
    title: "Full Stack Project",
    description: "Build a complete full-stack application using React, TypeScript, Node.js, and database integration. Deploy to production.",
    duration: "3 weeks",
    status: "upcoming",
    type: "project",
    skills: ["React", "TypeScript", "Node.js", "Database"],
    resources: [
      { name: "Project Requirements", url: "#", type: "Documentation" },
      { name: "Starter Template", url: "#", type: "Template" },
      { name: "Deployment Guide", url: "#", type: "Tutorial" },
    ],
  },
  {
    id: "5",
    title: "Database Design & SQL",
    description: "Learn database design principles, SQL queries, and database optimization. Work with both SQL and NoSQL databases.",
    duration: "2 weeks",
    status: "upcoming",
    type: "course",
    skills: ["SQL", "Database Design", "MongoDB"],
    resources: [
      { name: "SQL Tutorial", url: "#", type: "Course" },
      { name: "Database Design Guide", url: "#", type: "Documentation" },
      { name: "MongoDB University", url: "#", type: "Course" },
    ],
  },
  {
    id: "6",
    title: "DevOps & Deployment",
    description: "Learn Docker, CI/CD pipelines, and cloud deployment. Set up automated testing and deployment workflows.",
    duration: "2 weeks",
    status: "upcoming",
    type: "practice",
    skills: ["Docker", "CI/CD", "AWS"],
    resources: [
      { name: "Docker Tutorial", url: "#", type: "Course" },
      { name: "GitHub Actions Guide", url: "#", type: "Documentation" },
      { name: "AWS Deployment", url: "#", type: "Tutorial" },
    ],
  },
]

export default function Roadmap() {
  const { user } = useAuth()
  const [roadmapData, setRoadmapData] = useState<Milestone[]>([])
  const [expandedId, setExpandedId] = useState<string>("2")
  const [loading, setLoading] = useState(true)
  const [activeCourse, setActiveCourse] = useState<CourseSession | null>(null)
  const [courseProgress, setCourseProgress] = useState<{[key: string]: CourseSession[]}>({})
  const [activeSession, setActiveSession] = useState<CourseSession | null>(null)

  useEffect(() => {
    if (user) {
      loadRoadmap()
    } else {
      setLoading(false)
      // Load sample data for demo
      const dataWithSessions = sampleRoadmapData.map(milestone => ({
        ...milestone,
        sessions: generateCourseSessions(milestone)
      }))
      setRoadmapData(dataWithSessions)
    }
  }, [user])

  const loadRoadmap = async () => {
    const { data } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user?.id)
      .order('order_index', { ascending: true })
    
    if (data && data.length > 0) {
      // Add sessions to existing data
      const dataWithSessions = data.map(milestone => ({
        ...milestone,
        sessions: generateCourseSessions(milestone)
      }))
      setRoadmapData(dataWithSessions)
      
      // Load course progress from localStorage
      const savedProgress = localStorage.getItem('courseProgress')
      if (savedProgress) {
        setCourseProgress(JSON.parse(savedProgress))
      }
    } else {
      setLoading(false)
      // Use sample data if no roadmap exists
      const dataWithSessions = sampleRoadmapData.map(milestone => ({
        ...milestone,
        sessions: generateCourseSessions(milestone)
      }))
      setRoadmapData(dataWithSessions)
    }
  }

  const startCourse = (milestone: Milestone, session: CourseSession) => {
    setActiveCourse(session)
    setActiveSession(session)
    setExpandedId(milestone.id)
    
    // Update session start time
    const milestoneProgress = courseProgress[milestone.id] || []
    const updatedSessions = milestoneProgress.map((s: CourseSession) => 
      s.id === session.id ? { ...s, startTime: new Date(), isCompleted: false } : s
    )
    setCourseProgress((prev: { [key: string]: CourseSession[] }) => ({
      ...prev,
      [milestone.id]: updatedSessions
    }))
  }

  const completeStep = (sessionId: string) => {
    const updatedProgress = { ...courseProgress }
    
    // Find and update the specific session
    Object.keys(updatedProgress).forEach((milestoneId: string) => {
      const sessions = updatedProgress[milestoneId] || []
      const sessionIndex = sessions.findIndex((s: CourseSession) => s.id === sessionId)
      
      if (sessionIndex >= 0) {
        const session = sessions[sessionIndex]
        const isLastStep = session.currentStep === session.totalSteps
        
        updatedProgress[milestoneId] = sessions.map((s: CourseSession, index: number) => {
          if (s.id === sessionId) {
            return { ...s, isCompleted: true, endTime: new Date() }
          }
          // Mark previous steps as completed if this is the last step
          if (isLastStep && index < sessionIndex) {
            return { ...s, isCompleted: true }
          }
          return s
        })
      }
    })
    
    setCourseProgress(updatedProgress)
    localStorage.setItem('courseProgress', JSON.stringify(updatedProgress))
    
    // If this was the last step, mark course as completed
    const currentSession = Object.values(updatedProgress).flat().find((s: CourseSession) => s.id === sessionId && s.isCompleted && s.endTime)
    if (currentSession) {
      // Update milestone status to completed
      setRoadmapData(prev => prev.map((m: Milestone) => 
        m.id === currentSession.milestoneId 
          ? { ...m, status: 'completed' as const }
          : m
      ))
    }
  }

  const handleQuizAnswer = (sessionId: string, answerIndex: number) => {
    const updatedProgress = { ...courseProgress }
    
    Object.keys(updatedProgress).forEach((milestoneId: string) => {
      const sessions = updatedProgress[milestoneId] || []
      const sessionIndex = sessions.findIndex((s: CourseSession) => s.id === sessionId)
      
      if (sessionIndex >= 0) {
        updatedProgress[milestoneId] = sessions.map((s: CourseSession, index: number) => {
          if (s.id === sessionId) {
            return { ...s, userAnswer: answerIndex }
          }
          return s
        })
      }
    })
    
    setCourseProgress(updatedProgress)
    localStorage.setItem('courseProgress', JSON.stringify(updatedProgress))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5" />
      case 'in-progress': return <Clock className="h-5 w-5" />
      default: return <Circle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success border-success'
      case 'in-progress': return 'text-primary border-primary animate-pulse-subtle'
      default: return 'text-muted-foreground border-muted-foreground/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />
      case 'project': return <Code2 className="h-4 w-4" />
      case 'practice': return <Trophy className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-info/10 text-info'
      case 'project': return 'bg-success/10 text-success'
      case 'practice': return 'bg-warning/10 text-warning'
      default: return 'bg-muted/10 text-muted-foreground'
    }
  }

  const calculateProgress = () => {
    if (roadmapData.length === 0) return 0
    
    // Calculate completed milestones
    const completedMilestones = roadmapData.filter(m => m.status === 'completed').length
    
    // Calculate completed course sessions
    const completedSessions = Object.values(courseProgress).flat().filter(s => s.isCompleted).length
    
    // Calculate total course sessions
    const totalSessions = Object.values(courseProgress).flat().length
    
    // If we have course sessions, use session-based progress, otherwise use milestone-based
    if (totalSessions > 0) {
      return Math.round((completedSessions / totalSessions) * 100)
    }
    
    return Math.round((completedMilestones / roadmapData.length) * 100)
  }

  const calculateDuration = () => {
    // Calculate based on completed sessions for more accuracy
    const completedSessions = Object.values(courseProgress).flat().filter(s => s.isCompleted)
    const totalDuration = completedSessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        const duration = session.endTime.getTime() - session.startTime.getTime()
        return total + Math.round(duration / (1000 * 60 * 60 * 24)) // Convert to days
      }
      return total
    }, 0)
    
    if (totalDuration > 0) {
      return `${totalDuration} days`
    }
    
    // Fallback to milestone-based calculation
    return roadmapData.reduce((total, milestone) => {
      const weeks = parseInt(milestone.duration) || 0
      return total + weeks
    }, 0)
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? '' : id)
    // Close active session when closing milestone
    if (expandedId === id) {
      setActiveSession(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading roadmap...</div>
      </div>
    )
  }

  const progress = calculateProgress()
  const totalDuration = calculateDuration()
  const completedCount = roadmapData.filter(m => m.status === 'completed').length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30">
            <Map className="h-4 w-4 mr-2" />
            Learning Path
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4 font-space-grotesk">
            Your Learning Roadmap
          </h1>
          <p className="text-xl text-gray-300">
            Personalized learning path to bridge your skill gaps
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Milestones Completed */}
          <Card className="glass-green hover-lift">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {completedCount}/{roadmapData.length}
              </div>
              <p className="text-gray-400">Milestones Completed</p>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card className="glass-orange hover-lift">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {progress}%
              </div>
              <p className="text-gray-400">Overall Progress</p>
            </CardContent>
          </Card>

          {/* Estimated Duration */}
          <Card className="glass-teal hover-lift">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {totalDuration}h
              </div>
              <p className="text-gray-400">Total Duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Gradient vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />
          
          {/* Milestones */}
          <div className="space-y-8">
            {roadmapData.map((milestone, index) => {
              const milestoneSessions = milestone.sessions || []
              const hasActiveCourse = activeCourse && activeCourse.milestoneId === milestone.id
              const milestoneProgress = (courseProgress[milestone.id] || [])
              
              return (
                <div key={milestone.id} className="relative flex items-start gap-8">
                  {/* Status circle on timeline */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${
                    milestone.status === 'in-progress' ? 'ring-2 ring-primary/50' : ''
                  } ${getStatusColor(milestone.status)} bg-background`}>
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Milestone card */}
                  <Card className={`flex-1 glass border-white/10 transition-all duration-300 cursor-pointer ${
                    milestone.status === 'in-progress' ? 'ring-2 ring-primary/50' : ''
                  }`}
                  onClick={() => toggleExpanded(milestone.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(milestone.type)}`}>
                            {getTypeIcon(milestone.type)}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {milestone.duration}
                              </Badge>
                              <Badge className={`text-xs ${
                                milestone.status === 'completed' ? 'bg-success/20 text-success border-success/30' :
                                milestone.status === 'in-progress' ? 'bg-primary/20 text-primary border-primary/30' :
                                'bg-muted/20 text-muted-foreground border-muted-foreground/30'
                              }`}>
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          {expandedId === milestone.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* Course progress indicator */}
                      {milestone.type === 'course' && courseProgress[milestone.id] && (
                        <div className="text-sm text-gray-400">
                          {courseProgress[milestone.id].filter(s => s.isCompleted).length}/{milestoneSessions.length} sessions completed
                        </div>
                      )}
                    </CardContent>

                    {/* Expanded view */}
                    {expandedId === milestone.id && (
                      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                        <p className="text-gray-300">{milestone.description}</p>
                        
                        {/* Course sessions */}
                        {milestone.type === 'course' && milestoneSessions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">Course Sessions:</h4>
                            <div className="space-y-3">
                              {milestoneSessions.map((session, sessionIndex) => {
                                const isCurrentSession = activeSession?.id === session.id
                                const isCompleted = session.isCompleted
                                
                                return (
                                  <div 
                                    key={session.id}
                                    className={`p-3 rounded-lg border ${
                                      isCurrentSession ? 'border-primary/50 bg-primary/10' : 
                                      isCompleted ? 'border-success/50 bg-success/10' : 
                                      'border-white/20 bg-background'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          Step {session.currentStep} of {session.totalSteps}: {session.title}
                                        </span>
                                        {isCompleted && (
                                          <CheckCircle2 className="h-4 w-4 text-success" />
                                        )}
                                      </div>
                                      
                                      {!isCompleted && !isCurrentSession && (
                                        <Button 
                                          size="sm" 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            startCourse(milestone, session)
                                          }}
                                          className="bg-primary hover:bg-primary/90"
                                        >
                                          Start
                                        </Button>
                                      )}
                                      
                                      {isCurrentSession && (
                                        <Button 
                                          size="sm" 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            completeStep(session.id)
                                          }}
                                          className="bg-success hover:bg-success/90"
                                        >
                                          Complete
                                        </Button>
                                      )}
                                    </div>

                                    {/* Course content for active session */}
                                    {isCurrentSession && (
                                      <div className="mt-4 p-4 bg-background/50 rounded-lg">
                                        <h5 className="text-lg font-semibold text-white mb-3">{session.title}</h5>
                                        <p className="text-gray-300 mb-4">{session.content}</p>
                                        
                                        <div className="mb-4">
                                          <h6 className="text-sm font-semibold text-white mb-2">Topics Covered:</h6>
                                          <div className="grid grid-cols-2 gap-2">
                                            {session.topics.map((topic, topicIndex) => (
                                              <div key={topicIndex} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                <span className="text-sm text-gray-300">{topic}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Quiz for last step */}
                                        {session.quiz && (
                                          <div className="mt-4 p-3 bg-background/50 rounded-lg">
                                            <h6 className="text-sm font-semibold text-white mb-2">Quick Quiz</h6>
                                            <p className="text-sm text-gray-300 mb-3">{session.quiz.question}</p>
                                            <div className="space-y-2">
                                              {session.quiz.options.map((option, optionIndex) => (
                                                <label 
                                                  key={optionIndex}
                                                  className={`flex items-center p-2 rounded cursor-pointer ${
                                                    session.userAnswer === optionIndex 
                                                      ? 'border-primary/50 bg-primary/20' 
                                                      : 'border-white/20 hover:bg-white/10'
                                                  }`}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleQuizAnswer(session.id, optionIndex)
                                                  }}
                                                >
                                                  <input 
                                                    type="radio" 
                                                    name={`quiz-${session.id}`}
                                                    checked={session.userAnswer === optionIndex}
                                                    className="mr-2"
                                                    readOnly
                                                  />
                                                  <span className="text-sm">{option}</span>
                                                </label>
                                              ))}
                                            </div>
                                            
                                            {session.userAnswer !== undefined && (
                                              <Button 
                                                size="sm" 
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  completeStep(session.id)
                                                }}
                                                className="w-full bg-success hover:bg-success/90"
                                              >
                                                Submit Quiz & Complete
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Skills */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Resources */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Resources:</h4>
                          <div className="space-y-2">
                            {milestone.resources.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {resource.type}
                                  </Badge>
                                  <span className="text-white text-sm">{resource.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <div className="pt-2">
                      {milestone.status === 'completed' ? (
                        <Button variant="outline" className="border-success/20 text-success hover:bg-success/10">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      ) : milestone.status === 'in-progress' && hasActiveCourse ? (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveCourse(null)
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Exit Course
                        </Button>
                      ) : milestone.status === 'in-progress' ? (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          variant="outline" className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Start This Milestone
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30 mb-4">
              <GraduationCap className="h-4 w-4 mr-2" />
              Complete Learning Pathway
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2 font-space-grotesk">
              Comprehensive Courses
            </h2>
            <p className="text-gray-400">
              8 complete courses designed to build your professional skills from fundamentals to advanced
            </p>
          </div>

          {/* Course Overview Cards */}
          <CoursesOverview />

          {/* View All Courses Button */}
          <div className="text-center mt-8">
            <Link href="/courses">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Briefcase className="h-4 w-4" />
                View All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CoursesOverviewProps {}

function CoursesOverview() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('completedCourses')
    if (saved) {
      setCompletedCourses(JSON.parse(saved))
    }
  }, [])

  const courses = [
    {
      id: 'model-1',
      model: '1',
      title: 'JavaScript Fundamentals',
      color: 'from-yellow-500 to-orange-600',
      icon: Code2,
      duration: '4 weeks',
      level: 'Beginner',
      modules: 7
    },
    {
      id: 'model-2',
      model: '2',
      title: 'TypeScript Mastery',
      color: 'from-blue-500 to-blue-600',
      icon: Code2,
      duration: '3 weeks',
      level: 'Intermediate',
      modules: 7
    },
    {
      id: 'model-3',
      model: '3',
      title: 'React & Advanced Patterns',
      color: 'from-cyan-500 to-cyan-600',
      icon: Code2,
      duration: '4 weeks',
      level: 'Intermediate',
      modules: 7
    },
    {
      id: 'model-4',
      model: '4',
      title: 'State Management & Redux',
      color: 'from-purple-500 to-purple-600',
      icon: Zap,
      duration: '3 weeks',
      level: 'Advanced',
      modules: 7
    },
    {
      id: 'model-5',
      model: '5',
      title: 'Backend Node.js & Express',
      color: 'from-green-500 to-green-600',
      icon: Briefcase,
      duration: '4 weeks',
      level: 'Intermediate',
      modules: 7
    },
    {
      id: 'model-6',
      model: '6',
      title: 'Database Design & SQL',
      color: 'from-red-500 to-red-600',
      icon: BookOpen,
      duration: '3 weeks',
      level: 'Intermediate',
      modules: 7
    },
    {
      id: 'model-7',
      model: '7',
      title: 'Testing & QA',
      color: 'from-indigo-500 to-indigo-600',
      icon: Trophy,
      duration: '3 weeks',
      level: 'Intermediate',
      modules: 7
    },
    {
      id: 'model-8',
      model: '8',
      title: 'Full Stack & Deployment',
      color: 'from-pink-500 to-pink-600',
      icon: Briefcase,
      duration: '4 weeks',
      level: 'Advanced',
      modules: 7
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {courses.map((course) => {
        const isCompleted = completedCourses.includes(course.id)
        const IconComponent = course.icon

        return (
          <Card 
            key={course.id}
            className={`glass border-white/10 hover-lift overflow-hidden cursor-pointer transition-all ${
              isCompleted ? 'ring-2 ring-success/50' : ''
            }`}
            onClick={() => router.push(`/courses/${course.id}`)}
          >
            <div className={`h-2 bg-gradient-to-r ${course.color}`} />
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${course.color} bg-opacity-20`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>

              <h3 className="font-semibold text-white mb-1 line-clamp-2">{course.title}</h3>
              <div className="flex items-center gap-1 mb-3">
                <Badge variant="outline" className="text-xs bg-white/5">
                  Model {course.model}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.modules} modules
                </div>
              </div>

              <Badge className={`text-xs w-full text-center justify-center ${
                isCompleted 
                  ? 'bg-success/20 text-success border-success/30' 
                  : 'bg-primary/20 text-primary border-primary/30'
              }`}>
                {isCompleted ? 'Completed ✓' : course.level}
              </Badge>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
