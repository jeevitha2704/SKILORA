'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  Brain,
  Clock,
  Target,
  Trophy,
  CheckCircle2,
  Play,
  Eye,
  Code2,
  MessageSquare,
  Zap,
  TrendingUp
} from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  skills: string[]
  completed: boolean
  category: string
}

interface BehavioralQuestion {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
}

interface PracticeSession {
  id: string
  practice_type: 'coding' | 'behavioral'
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
  completed: boolean
  completion_date?: string
  time_spent_minutes?: number
  notes?: string
  created_at: string
}

const sampleChallenges: Challenge[] = [
  {
    id: "1",
    title: "Two Sum Problem",
    description: "Given an array of integers and a target, return indices of two numbers that add up to target.",
    difficulty: "easy",
    duration: "15 min",
    skills: ["Arrays", "Hash Tables"],
    completed: true,
    category: "Arrays"
  },
  {
    id: "2",
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "easy",
    duration: "20 min",
    skills: ["Stacks", "Strings"],
    completed: false,
    category: "Strings"
  },
  {
    id: "3",
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "medium",
    duration: "25 min",
    skills: ["Trees", "Recursion"],
    completed: false,
    category: "Trees"
  },
  {
    id: "4",
    title: "Longest Increasing Subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    difficulty: "medium",
    duration: "30 min",
    skills: ["Dynamic Programming"],
    completed: false,
    category: "Dynamic Programming"
  },
  {
    id: "5",
    title: "Merge K Sorted Lists",
    description: "Given an array of k sorted linked lists, merge all the linked lists into one sorted linked list.",
    difficulty: "hard",
    duration: "35 min",
    skills: ["Linked Lists", "Heaps"],
    completed: false,
    category: "Arrays"
  },
  {
    id: "6",
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
    difficulty: "hard",
    duration: "40 min",
    skills: ["Dynamic Programming", "Strings"],
    completed: false,
    category: "Dynamic Programming"
  }
]

const sampleBehavioralQuestions: BehavioralQuestion[] = [
  {
    id: "1",
    question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    category: "Teamwork",
    difficulty: "medium",
    completed: true
  },
  {
    id: "2",
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    category: "Problem Solving",
    difficulty: "medium",
    completed: false
  },
  {
    id: "3",
    question: "Why do you want to work at this company? What interests you about our products/services?",
    category: "Motivation",
    difficulty: "easy",
    completed: false
  },
  {
    id: "4",
    question: "How do you stay updated with the latest technology trends and best practices?",
    category: "Learning",
    difficulty: "easy",
    completed: false
  }
]

const codingChallenges = [
  {
    id: '1',
    title: 'React Component State Management',
    description: 'Build a todo app using React hooks and state management',
    difficulty: 'medium' as const,
    topics: ['React', 'State Management', 'Hooks'],
    estimatedTime: 45
  },
  {
    id: '2',
    title: 'Array Manipulation',
    description: 'Implement common array operations and algorithms',
    difficulty: 'easy' as const,
    topics: ['JavaScript', 'Arrays', 'Algorithms'],
    estimatedTime: 30
  },
  {
    id: '3',
    title: 'Async JavaScript Promises',
    description: 'Master asynchronous programming with Promises and async/await',
    difficulty: 'hard' as const,
    topics: ['JavaScript', 'Async', 'Promises'],
    estimatedTime: 60
  },
  {
    id: '4',
    title: 'CSS Grid Layout',
    description: 'Create responsive layouts using CSS Grid',
    difficulty: 'medium' as const,
    topics: ['CSS', 'Grid', 'Responsive'],
    estimatedTime: 40
  },
  {
    id: '5',
    title: 'REST API Integration',
    description: 'Build a frontend that consumes a REST API',
    difficulty: 'hard' as const,
    topics: ['API', 'Fetch', 'JSON'],
    estimatedTime: 90
  },
  {
    id: '6',
    title: 'TypeScript Interfaces',
    description: 'Implement TypeScript interfaces and type safety',
    difficulty: 'medium' as const,
    topics: ['TypeScript', 'Types', 'Interfaces'],
    estimatedTime: 50
  }
]

const behavioralQuestions = [
  {
    id: '1',
    title: 'Tell me about yourself',
    description: 'Practice your personal introduction and career story',
    difficulty: 'easy' as const,
    topics: ['Introduction', 'Personal Story'],
    estimatedTime: 5
  },
  {
    id: '2',
    title: 'Describe a challenging project',
    description: 'Explain a difficult project and how you overcame obstacles',
    difficulty: 'medium' as const,
    topics: ['Problem Solving', 'Communication'],
    estimatedTime: 10
  },
  {
    id: '3',
    title: 'How do you handle conflicts?',
    description: 'Practice answering behavioral questions about conflict resolution',
    difficulty: 'medium' as const,
    topics: ['Conflict Resolution', 'Teamwork'],
    estimatedTime: 8
  },
  {
    id: '4',
    title: 'Where do you see yourself in 5 years?',
    description: 'Practice discussing career goals and aspirations',
    difficulty: 'easy' as const,
    topics: ['Career Goals', 'Planning'],
    estimatedTime: 5
  },
  {
    id: '5',
    title: 'Describe a time you failed',
    description: 'Practice discussing failures and lessons learned',
    difficulty: 'hard' as const,
    topics: ['Failure', 'Learning', 'Resilience'],
    estimatedTime: 12
  },
  {
    id: '6',
    title: 'How do you stay updated with technology?',
    description: 'Practice discussing continuous learning and skill development',
    difficulty: 'medium' as const,
    topics: ['Learning', 'Technology Trends'],
    estimatedTime: 7
  }
]

export default function Practice() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [behavioralQuestions, setBehavioralQuestions] = useState<BehavioralQuestion[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPracticeData()
    } else {
      setLoading(false)
      // Load sample data for demo
      setChallenges(sampleChallenges)
      setBehavioralQuestions(sampleBehavioralQuestions)
    }
  }, [user])

  const loadPracticeData = async () => {
    // Load challenges
    const { data: challengeData } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('type', 'coding')
    
    if (challengeData && challengeData.length > 0) {
      setChallenges(challengeData)
    } else {
      setChallenges(sampleChallenges)
    }

    // Load behavioral questions
    const { data: behavioralData } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('type', 'behavioral')
    
    if (behavioralData && behavioralData.length > 0) {
      setBehavioralQuestions(behavioralData)
    } else {
      setBehavioralQuestions(sampleBehavioralQuestions)
    }
    
    setLoading(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/20 text-success border-success/30'
      case 'medium': return 'bg-warning/20 text-warning border-warning/30'
      case 'hard': return 'bg-destructive/20 text-destructive border-destructive/30'
      default: return 'bg-muted/20 text-muted-foreground border-muted-foreground/30'
    }
  }

  const getCategories = () => {
    const categories = ['All', ...new Set(challenges.map(c => c.category))]
    return categories
  }

  const getFilteredChallenges = () => {
    if (selectedCategory === 'All') return challenges
    return challenges.filter(c => c.category === selectedCategory)
  }

  const calculateStats = () => {
    const completed = challenges.filter(c => c.completed).length
    const total = challenges.length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgScore = 85 // Mock average score
    
    return { completed, total, progress, avgScore }
  }

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card className={`glass hover-lift interactive transition-all duration-300 ${
      challenge.completed ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-6">
        {challenge.completed && (
          <div className="absolute top-4 right-4">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">{challenge.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{challenge.description}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge className={getDifficultyColor(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>{challenge.duration}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {challenge.skills.map((skill: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-primary/10 border-primary/30 text-primary">
              {skill}
            </Badge>
          ))}
        </div>

        <Button 
          className={`w-full hover-lift ${
            challenge.completed 
              ? 'border-success/20 text-success hover:bg-success/10' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          variant={challenge.completed ? "outline" : "default"}
        >
          {challenge.completed ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Review Solution
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Challenge
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  const BehavioralCard = ({ question }: { question: BehavioralQuestion }) => (
    <Card className={`glass hover-lift interactive transition-all duration-300 ${
      question.completed ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-6">
        {question.completed && (
          <div className="absolute top-4 right-4">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Behavioral Question</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{question.question}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
            {question.category}
          </Badge>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>

        <Button 
          className={`w-full hover-lift ${
            question.completed 
              ? 'border-success/20 text-success hover:bg-success/10' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          variant={question.completed ? "outline" : "default"}
        >
          {question.completed ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Review Answer
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Practice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading practice hub...</div>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-4 font-space-grotesk">
            Practice Hub
          </h1>
          <p className="text-xl text-gray-300">
            Sharpen your skills with coding challenges and behavioral prep
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-teal hover-lift animate-scale-in">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-400">Completed Challenges</div>
            </CardContent>
          </Card>

          <Card className="glass-orange hover-lift animate-scale-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.progress}%</div>
              <div className="text-sm text-gray-400">Total Progress</div>
            </CardContent>
          </Card>

          <Card className="glass-green hover-lift animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 text-success mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.avgScore}</div>
              <div className="text-sm text-gray-400">Average Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="coding" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 border-white/20">
            <TabsTrigger value="coding" className="text-white data-[state=active]:bg-primary/20">
              <Code2 className="h-4 w-4 mr-2" />
              Coding Challenges
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="text-white data-[state=active]:bg-primary/20">
              <MessageSquare className="h-4 w-4 mr-2" />
              Behavioral Prep
            </TabsTrigger>
          </TabsList>

          {/* Coding Challenges Tab */}
          <TabsContent value="coding" className="mt-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {getCategories().map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredChallenges().map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          {/* Behavioral Prep Tab */}
          <TabsContent value="behavioral" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {behavioralQuestions.map((question) => (
                <BehavioralCard key={question.id} question={question} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
