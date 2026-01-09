'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Target
} from 'lucide-react'

interface Milestone {
  id: string
  title: string
  description: string
  duration: string
  status: 'completed' | 'in-progress' | 'upcoming'
  type: 'course' | 'project' | 'practice'
  resources: { name: string; url: string; type: string }[]
  skills: string[]
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

  useEffect(() => {
    if (user) {
      loadRoadmap()
    } else {
      setLoading(false)
      // Load sample data for demo
      setRoadmapData(sampleRoadmapData)
    }
  }, [user])

  const loadRoadmap = async () => {
    const { data } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user?.id)
      .order('order_index', { ascending: true })
    
    if (data && data.length > 0) {
      setRoadmapData(data)
    } else {
      setLoading(false)
      // Use sample data if no roadmap exists
      setRoadmapData(sampleRoadmapData)
    }
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
    const completed = roadmapData.filter(m => m.status === 'completed').length
    return Math.round((completed / roadmapData.length) * 100)
  }

  const calculateDuration = () => {
    return roadmapData.reduce((total, milestone) => {
      const weeks = parseInt(milestone.duration) || 0
      return total + weeks
    }, 0)
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? '' : id)
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
            {roadmapData.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start gap-8">
                {/* Status circle on timeline */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${getStatusColor(milestone.status)} bg-background`}>
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Milestone card */}
                <Card className={`flex-1 glass border-white/10 transition-all duration-300 ${
                  milestone.status === 'in-progress' ? 'ring-2 ring-primary/50' : ''
                }`}>
                  <CardContent className="p-6">
                    {/* Collapsed view */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(milestone.id)}
                    >
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
                    </div>

                    {/* Expanded view */}
                    {expandedId === milestone.id && (
                      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                        <p className="text-gray-300">{milestone.description}</p>
                        
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

                        {/* Action button */}
                        <div className="pt-2">
                          {milestone.status === 'completed' ? (
                            <Button variant="outline" className="border-success/20 text-success hover:bg-success/10">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Completed
                            </Button>
                          ) : milestone.status === 'in-progress' ? (
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Target className="h-4 w-4 mr-2" />
                              Continue Learning
                            </Button>
                          ) : (
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                              <Target className="h-4 w-4 mr-2" />
                              Start This Milestone
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
