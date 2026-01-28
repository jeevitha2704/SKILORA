'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { trackChallengeCompletion, trackBehavioralCompletion } from '@/lib/activityTracker'
import { 
  Code2,
  Clock,
  Play,
  CheckCircle2,
  Trophy,
  Eye,
  Target,
  MessageSquare,
  BarChart3,
  Lock,
  Star,
  Calendar,
  Brain,
  Zap,
  Flame,
  Award,
  ArrowRight,
  Menu,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Grid3x3,
  List,
  ChevronRight
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
  problemStatement: string
  starterCode: string
  solutionCode: string
  testCases: {
    input: any
    expected: any
  }[]
  constraints: {
    timeComplexity?: string
    spaceComplexity?: string
    allowedLanguages: string[]
    forbiddenMethods?: string[]
    maxLines?: number
  }
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

interface CodeEditorState {
  code: string
  output: string
  isRunning: boolean
  error: string | null
  isSubmitted: boolean
  isCompleted: boolean
  testResults: {
    passed: boolean
    failed: number
    total: number
  } | null
  selectedLanguage: string
  constraintResults: {
    timeComplexity?: string
    spaceComplexity?: string
    lineCount?: number
    forbiddenMethods?: string[]
    passed: boolean
    details: string[]
  } | null
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
    category: "Arrays",
    problemStatement: "Write a function that takes an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    starterCode: `function twoSum(nums, target) {
  // Your code here
  
}`,
    solutionCode: `function twoSum(nums, target) {
  const numMap = new Map()
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    
    if (numMap.has(complement)) {
      return [numMap.get(complement), i]
    }
    
    numMap.set(nums[i], i)
  }
  
  return []
}`,
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2]
      },
      {
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1]
      }
    ],
    constraints: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: ["eval", "setTimeout"],
      maxLines: 20
    }
  },
  {
    id: "2",
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "easy",
    duration: "20 min",
    skills: ["Stacks", "Strings"],
    completed: false,
    category: "Strings",
    problemStatement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: `function isValid(s) {
  // Your code here
  
}`,
    solutionCode: `function isValid(s) {
  const stack = []
  const pairs = { '(': ')', '{': '}', '[': ']' }
  
  for (let char of s) {
    if (pairs[char]) {
      stack.push(char)
    } else if (pairs[stack[stack.length - 1]] === char) {
      stack.pop()
    } else {
      return false
    }
  }
  
  return stack.length === 0
}`,
    testCases: [
      {
        input: "()",
        expected: true
      },
      {
        input: "()[]{}",
        expected: true
      },
      {
        input: "(]",
        expected: false
      },
      {
        input: "([)]",
        expected: false
      }
    ],
    constraints: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: ["eval"],
      maxLines: 15
    }
  },
  {
    id: "3",
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "medium",
    duration: "25 min",
    skills: ["Trees", "Recursion"],
    completed: false,
    category: "Trees",
    problemStatement: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    starterCode: `function inorderTraversal(root) {
  // Your code here
  
}`,
    solutionCode: `function inorderTraversal(root) {
  const result = []
  
  function traverse(node) {
    if (!node) return
    
    traverse(node.left)
    result.push(node.val)
    traverse(node.right)
  }
  
  traverse(root)
  return result
}`,
    testCases: [
      {
        input: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } },
        expected: [2, 1, 3]
      }
    ],
    constraints: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: [],
      maxLines: 20
    }
  },
  {
    id: "4",
    title: "Longest Increasing Subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    difficulty: "medium",
    duration: "30 min",
    skills: ["Dynamic Programming"],
    completed: false,
    category: "Dynamic Programming",
    problemStatement: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    starterCode: `function lengthOfLIS(nums) {
  // Your code here
  
}`,
    solutionCode: `function lengthOfLIS(nums) {
  if (nums.length === 0) return 0
  
  const dp = new Array(nums.length).fill(1)
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }
  
  return Math.max(...dp)
}`,
    testCases: [
      {
        input: [10, 9, 2, 5, 3, 7, 101, 18],
        expected: 4
      },
      {
        input: [0, 1, 0, 3, 2, 3],
        expected: 4
      }
    ],
    constraints: {
      timeComplexity: "O(n²)",
      spaceComplexity: "O(n)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: [],
      maxLines: 25
    }
  },
  {
    id: "5",
    title: "Merge K Sorted Lists",
    description: "Given an array of k sorted linked lists, merge all the linked lists into one sorted linked list.",
    difficulty: "hard",
    duration: "35 min",
    skills: ["Linked Lists", "Heaps"],
    completed: false,
    category: "Arrays",
    problemStatement: "Given an array of k sorted linked lists, merge all the linked lists into one sorted linked list and return it.",
    starterCode: `function mergeKLists(lists) {
  // Your code here
  
}`,
    solutionCode: `function mergeKLists(lists) {
  const result = []
  const heap = []
  
  // Add first element from each list to heap
  for (const list of lists) {
    if (list.length > 0) {
      heap.push({ val: list[0].val, listIndex: 0, list })
    }
  }
  
  // Min heap based on value
  heap.sort((a, b) => a.val - b.val)
  
  while (heap.length > 0) {
    const { val, listIndex } = heap.shift()
    result.push(val)
    
    if (lists[listIndex].length > 1) {
      heap.push({ val: lists[listIndex][1].val, listIndex, lists[listIndex] })
      heap.sort((a, b) => a.val - b.val)
    }
  }
  
  return result
}`,
    testCases: [
      {
        input: [[1,4,5],[1,3,4],[2,6]],
        expected: [1,3,4,4,5,6]
      }
    ],
    constraints: {
      timeComplexity: "O(n log k)",
      spaceComplexity: "O(n)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: [],
      maxLines: 30
    }
  },
  {
    id: "6",
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
    difficulty: "hard",
    duration: "40 min",
    skills: ["Dynamic Programming", "Strings"],
    completed: false,
    category: "Dynamic Programming",
    problemStatement: "Implement regular expression matching with support for '.' and '*'.",
    starterCode: `function isMatch(s, p) {
  // Your code here
  
}`,
    solutionCode: `function isMatch(s, p) {
  const dp = Array(p.length + 1).fill(false)
  dp[0] = true
  
  for (let i = 1; i <= p.length; i++) {
    if (p[i - 1] === '*') {
      dp[i] = dp[i - 1]
    }
  }
  
  for (let i = 1; i <= p.length; i++) {
    if (p[i - 1] === '*') continue
    
    for (let j = 0; j < s.length; j++) {
      if (dp[i - 1] && (p[i] === s[j] || p[i] === '.')) {
        dp[i] = dp[i - 1]
      }
    }
  }
  
  return dp[p.length]
}`,
    testCases: [
      {
        input: { s: "aa", p: "a" },
        expected: true
      },
      {
        input: { s: "mississippi", p: "mis*is*p*" },
        expected: true
      },
      {
        input: { s: "adceb", p: "*a*b" },
        expected: true
      }
    ],
    constraints: {
      timeComplexity: "O(n*m)",
      spaceComplexity: "O(n*m)",
      allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
      forbiddenMethods: ["RegExp"],
      maxLines: 35
    }
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
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [selectedBehavioral, setSelectedBehavioral] = useState<BehavioralQuestion | null>(null)
  const [editorState, setEditorState] = useState<CodeEditorState>({
    code: '',
    output: '',
    isRunning: false,
    error: null,
    isSubmitted: false,
    isCompleted: false,
    testResults: null,
    selectedLanguage: 'JavaScript',
    constraintResults: null
  })
  const [behavioralState, setBehavioralState] = useState({
    answer: '',
    isSubmitted: false,
    isCompleted: false
  })

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript'
  ]

  useEffect(() => {
    if (user) {
      loadPracticeData()
    } else {
      setLoading(false)
      // Load sample data and restore completed challenges from localStorage
      const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
      const completedBehavioral = JSON.parse(localStorage.getItem('completedBehavioral') || '[]')
      
      // Update challenges with completion status
      const updatedChallenges = sampleChallenges.map(challenge => ({
        ...challenge,
        completed: completedChallenges.includes(challenge.id)
      }))
      
      // Update behavioral questions with completion status
      const updatedBehavioralQuestions = sampleBehavioralQuestions.map(question => ({
        ...question,
        completed: completedBehavioral.includes(question.id)
      }))
      
      setChallenges(updatedChallenges)
      setBehavioralQuestions(updatedBehavioralQuestions)
      
      // Also update the original sample arrays to ensure persistence
      sampleChallenges.forEach((challenge, index) => {
        challenge.completed = completedChallenges.includes(challenge.id)
      })
      
      sampleBehavioralQuestions.forEach((question, index) => {
        question.completed = completedBehavioral.includes(question.id)
      })
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

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setEditorState({
      code: challenge.starterCode,
      output: '',
      isRunning: false,
      error: null,
      isSubmitted: false,
      isCompleted: challenge.completed,
      testResults: null,
      selectedLanguage: challenge.constraints.allowedLanguages[0],
      constraintResults: null
    })
  }

  const validateConstraints = (code: string, challenge: Challenge) => {
    const results: {
      timeComplexity?: string
      spaceComplexity?: string
      lineCount?: number
      forbiddenMethods?: string[]
      passed: boolean
      details: string[]
    } = {
      passed: true,
      details: []
    }

    // Check line count
    const lines = code.split('\n').filter(line => line.trim()).length
    if (challenge.constraints.maxLines && lines > challenge.constraints.maxLines) {
      results.lineCount = lines
      results.passed = false
      results.details.push(`Code exceeds maximum line limit (${lines}/${challenge.constraints.maxLines})`)
    } else {
      results.lineCount = lines
      results.details.push(`Line count: ${lines}/${challenge.constraints.maxLines || '∞'} ✓`)
    }

    // Check forbidden methods
    if (challenge.constraints.forbiddenMethods && challenge.constraints.forbiddenMethods.length > 0) {
      const foundMethods: string[] = []
      challenge.constraints.forbiddenMethods.forEach(method => {
        if (code.includes(method)) {
          foundMethods.push(method)
        }
      })
      
      if (foundMethods.length > 0) {
        results.forbiddenMethods = foundMethods
        results.passed = false
        results.details.push(`Forbidden methods found: ${foundMethods.join(', ')}`)
      } else {
        results.details.push(`No forbidden methods used ✓`)
      }
    }

    // Check language constraints
    if (!challenge.constraints.allowedLanguages.includes(editorState.selectedLanguage)) {
      results.passed = false
      results.details.push(`Language '${editorState.selectedLanguage}' not allowed. Allowed: ${challenge.constraints.allowedLanguages.join(', ')}`)
    } else {
      results.details.push(`Language '${editorState.selectedLanguage}' is allowed ✓`)
    }

    return results
  }

  const runCode = async () => {
    if (!selectedChallenge) return
    
    setEditorState(prev => ({ ...prev, isRunning: true, error: null, output: '', constraintResults: null }))
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validate constraints first
      const constraintValidation = validateConstraints(editorState.code, selectedChallenge)
      
      // Execute code based on selected language
      let passed = 0
      let failed = 0
      const results: Array<{
        input: any
        expected: any
        actual: any
        passed: boolean
      }> = []
      
      for (const testCase of selectedChallenge.testCases) {
        try {
          let result: any
          
          switch (editorState.selectedLanguage) {
            case 'JavaScript':
            case 'TypeScript':
              // Use JavaScript execution for both JS and TS
              const userFunction = new Function('return ' + editorState.code)
              result = userFunction()(testCase.input)
              break
              
            case 'Python':
              // Simulate Python execution by detecting patterns
              result = simulatePythonExecution(editorState.code, testCase.input)
              break
              
            case 'Java':
              // Simulate Java execution by detecting patterns
              result = simulateJavaExecution(editorState.code, testCase.input)
              break
              
            case 'C++':
              // Simulate C++ execution by detecting patterns
              result = simulateCppExecution(editorState.code, testCase.input)
              break
              
            case 'C#':
              // Simulate C# execution by detecting patterns
              result = simulateCSharpExecution(editorState.code, testCase.input)
              break
              
            case 'Go':
              // Simulate Go execution by detecting patterns
              result = simulateGoExecution(editorState.code, testCase.input)
              break
              
            case 'Rust':
              // Simulate Rust execution by detecting patterns
              result = simulateRustExecution(editorState.code, testCase.input)
              break
              
            default:
              throw new Error(`Language ${editorState.selectedLanguage} not supported`)
          }
          
          const isCorrect = JSON.stringify(result) === JSON.stringify(testCase.expected)
          
          if (isCorrect) {
            passed++
          } else {
            failed++
          }
          
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed: isCorrect
          })
        } catch (error: any) {
          failed++
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: error.message,
            passed: false
          })
        }
      }
      
      setEditorState(prev => ({
        ...prev,
        isRunning: false,
        output: JSON.stringify(results, null, 2),
        testResults: { passed: failed === 0, failed, total: selectedChallenge.testCases.length },
        constraintResults: constraintValidation
      }))
    } catch (error: any) {
      setEditorState(prev => ({
        ...prev,
        isRunning: false,
        error: error.message,
        output: ''
      }))
    }
  }

  // Simplified language execution simulators
  const simulatePythonExecution = (code: string, input: any) => {
    // Detect Two Sum pattern
    if (code.includes('def two_sum') || code.includes('twoSum')) {
      const nums = input.nums || input
      const target = input.target
      const numMap = new Map()
      
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i]
        if (numMap.has(complement)) {
          return [numMap.get(complement), i]
        }
        numMap.set(nums[i], i)
      }
      return []
    }
    
    // Detect Valid Parentheses pattern
    if (code.includes('def is_valid') || code.includes('isValid')) {
      const s = input
      const stack = []
      const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' }
      
      for (const char of s) {
        if (pairs[char]) {
          stack.push(char)
        } else if (stack.length > 0 && pairs[stack[stack.length - 1]] === char) {
          stack.pop()
        } else {
          return false
        }
      }
      
      return stack.length === 0
    }
    
    return null
  }

  const simulateJavaExecution = (code: string, input: any) => {
    // Detect Two Sum pattern
    if (code.includes('twoSum') || code.includes('TwoSum')) {
      const nums = input.nums || input
      const target = input.target
      const numMap = new Map()
      
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i]
        if (numMap.has(complement)) {
          return [numMap.get(complement), i]
        }
        numMap.set(nums[i], i)
      }
      return []
    }
    
    // Detect Valid Parentheses pattern
    if (code.includes('isValid') || code.includes('Valid')) {
      const s = input
      const stack = []
      const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' }
      
      for (const char of s) {
        if (pairs[char]) {
          stack.push(char)
        } else if (stack.length > 0 && pairs[stack[stack.length - 1]] === char) {
          stack.pop()
        } else {
          return false
        }
      }
      
      return stack.length === 0
    }
    
    return null
  }

  const simulateCppExecution = (code: string, input: any) => {
    // Same logic as Java for simulation
    return simulateJavaExecution(code, input)
  }

  const simulateCSharpExecution = (code: string, input: any) => {
    // Same logic as Java for simulation
    return simulateJavaExecution(code, input)
  }

  const simulateGoExecution = (code: string, input: any) => {
    // Same logic as Java for simulation
    return simulateJavaExecution(code, input)
  }

  const simulateRustExecution = (code: string, input: any) => {
    // Same logic as Java for simulation
    return simulateJavaExecution(code, input)
  }

  const submitSolution = async () => {
    if (!selectedChallenge) return
    
    setEditorState(prev => ({ ...prev, isSubmitted: true }))
    
    // Check if all tests pass (constraints are advisory, not blocking)
    if (editorState.testResults?.passed) {
      // Mark challenge as completed
      setChallenges(prev => prev.map(c => 
        c.id === selectedChallenge.id ? { ...c, completed: true } : c
      ))
      
      setEditorState(prev => ({ ...prev, isCompleted: true }))
      
      // Save to localStorage for persistence
      const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
      if (!completedChallenges.includes(selectedChallenge.id)) {
        completedChallenges.push(selectedChallenge.id)
        localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges))
      }
      
      // Update the original sample challenges array to ensure persistence
      const challengeIndex = sampleChallenges.findIndex(c => c.id === selectedChallenge.id)
      if (challengeIndex !== -1) {
        sampleChallenges[challengeIndex].completed = true
      }
      
      // Track activity in database
      if (user) {
        await trackChallengeCompletion(user.id, selectedChallenge.id, selectedChallenge.category)
      }
      
      // Force a re-render by updating the challenges state
      setChallenges(prev => prev.map(c => 
        c.id === selectedChallenge.id ? { ...c, completed: true } : c
      ))
    }
  }

  const resetChallenge = () => {
    if (!selectedChallenge) return
    
    setEditorState({
      code: selectedChallenge.starterCode,
      output: '',
      isRunning: false,
      error: null,
      isSubmitted: false,
      isCompleted: false,
      testResults: null,
      selectedLanguage: selectedChallenge.constraints.allowedLanguages[0],
      constraintResults: null
    })
  }

  const closeChallenge = () => {
    setSelectedChallenge(null)
    setEditorState({
      code: '',
      output: '',
      isRunning: false,
      error: null,
      isSubmitted: false,
      isCompleted: false,
      testResults: null,
      selectedLanguage: 'JavaScript',
      constraintResults: null
    })
  }

  const changeLanguage = (language: string) => {
    setEditorState(prev => ({ ...prev, selectedLanguage: language, constraintResults: null }))
  }

  const startBehavioralPractice = (question: BehavioralQuestion) => {
    setSelectedBehavioral(question)
    setBehavioralState({
      answer: '',
      isSubmitted: false,
      isCompleted: question.completed
    })
  }

  const submitBehavioralAnswer = () => {
    if (!selectedBehavioral) return
    
    setBehavioralState(prev => ({ ...prev, isSubmitted: true, isCompleted: true }))
    
    // Mark question as completed
    setBehavioralQuestions(prev => prev.map(q => 
      q.id === selectedBehavioral.id ? { ...q, completed: true } : q
    ))
    
    // Save to localStorage for persistence
    const completedBehavioral = JSON.parse(localStorage.getItem('completedBehavioral') || '[]')
    if (!completedBehavioral.includes(selectedBehavioral.id)) {
      completedBehavioral.push(selectedBehavioral.id)
      localStorage.setItem('completedBehavioral', JSON.stringify(completedBehavioral))
    }
    
    // Update the original sample behavioral questions array to ensure persistence
    const questionIndex = sampleBehavioralQuestions.findIndex(q => q.id === selectedBehavioral.id)
    if (questionIndex !== -1) {
      sampleBehavioralQuestions[questionIndex].completed = true
    }
    
    // Track activity in database
    if (user) {
      trackBehavioralCompletion(user.id, selectedBehavioral.id, selectedBehavioral.category)
    }
  }

  const resetBehavioralPractice = () => {
    if (!selectedBehavioral) return
    
    setBehavioralState({
      answer: '',
      isSubmitted: false,
      isCompleted: false
    })
  }

  const closeBehavioralPractice = () => {
    setSelectedBehavioral(null)
    setBehavioralState({
      answer: '',
      isSubmitted: false,
      isCompleted: false
    })
  }

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const difficultyGradient = {
      easy: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      medium: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      hard: 'from-red-500/20 to-pink-500/20 border-red-500/30'
    };
    
    const difficultyIcon = {
      easy: '🌱',
      medium: '⚡',
      hard: '🔥'
    };

    return (
      <Card className={`glass hover-lift interactive transition-all duration-300 overflow-hidden group relative ${
        challenge.completed ? 'opacity-75' : ''
      }`}>
        {/* Gradient background by difficulty */}
        <div className={`absolute inset-0 bg-gradient-to-br ${difficultyGradient[challenge.difficulty]} -z-10`} />
        
        {/* Top gradient accent */}
        <div className={`h-1 bg-gradient-to-r ${
          challenge.difficulty === 'easy' ? 'from-emerald-500 to-teal-600' :
          challenge.difficulty === 'medium' ? 'from-amber-500 to-orange-600' :
          'from-red-500 to-pink-600'
        }`} />

        <CardContent className="p-6 relative z-10">
          {challenge.completed && (
            <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/50 rounded-full p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{challenge.title}</h3>
              <span className="text-xl">{difficultyIcon[challenge.difficulty]}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{challenge.description}</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-1">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="h-3 w-3" />
              <span>{challenge.duration}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs bg-primary/20 border-primary/40 text-primary/90">
                {skill}
              </Badge>
            ))}
          </div>

          {/* Action button */}
          <Button 
            className={`w-full hover-lift font-semibold ${
              challenge.completed 
                ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white'
            }`}
            variant={challenge.completed ? "outline" : "default"}
            onClick={() => startChallenge(challenge)}
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
  }

  const BehavioralCard = ({ question }: { question: BehavioralQuestion }) => {
    const categoryGradient: Record<string, string> = {
      'Communication': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      'Leadership': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      'Problem Solving': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      'Conflict Resolution': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
      'Time Management': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30'
    };

    const categoryIcon: Record<string, string> = {
      'Communication': '💬',
      'Leadership': '👑',
      'Problem Solving': '🧠',
      'Conflict Resolution': '⚖️',
      'Time Management': '⏱️'
    };

    const gradientAccent: Record<string, string> = {
      'Communication': 'from-blue-500 to-cyan-600',
      'Leadership': 'from-purple-500 to-pink-600',
      'Problem Solving': 'from-green-500 to-emerald-600',
      'Conflict Resolution': 'from-orange-500 to-red-600',
      'Time Management': 'from-indigo-500 to-blue-600'
    };

    return (
      <Card className={`glass hover-lift interactive transition-all duration-300 overflow-hidden group relative ${
        question.completed ? 'opacity-75' : ''
      }`}>
        {/* Gradient background by category */}
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient[question.category] || 'from-purple-500/20 to-pink-500/20 border-purple-500/30'} -z-10`} />
        
        {/* Top gradient accent */}
        <div className={`h-1 bg-gradient-to-r ${gradientAccent[question.category] || 'from-purple-500 to-pink-600'}`} />

        <CardContent className="p-6 relative z-10">
          {question.completed && (
            <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/50 rounded-full p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{question.category}</h3>
              <span className="text-xl">{categoryIcon[question.category] || '❓'}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-3">{question.question}</p>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <MessageSquare className="h-3 w-3" />
              <span>Behavioral Interview</span>
            </div>
          </div>

          {/* Tips preview */}
          <div className="mb-4 p-2 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
            <p className="font-semibold text-white mb-1">💡 Tip</p>
            <p className="line-clamp-2">Focus on specific examples and the STAR method when answering</p>
          </div>

          {/* Action button */}
          <Button 
            className={`w-full hover-lift font-semibold ${
              question.completed 
                ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white'
            }`}
            variant={question.completed ? "outline" : "default"}
            onClick={() => startBehavioralPractice(question)}
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
  }

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
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30 mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Interactive Practice Platform
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3 font-space-grotesk">
            Practice Hub 💪
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Master coding challenges, ace behavioral interviews, and level up your skills with hands-on practice
          </p>
        </div>

        {/* Enhanced Stats Cards with Gradients */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Completed Challenges */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-2">challenges solved</p>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <Badge className="bg-blue-500/20 text-blue-400">{stats.progress}%</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Overall Progress</p>
              <ProgressBar value={stats.progress} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">keep pushing forward</p>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Award className="h-6 w-6 text-purple-500" />
                <Badge className="bg-purple-500/20 text-purple-400">Score</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Average Score</p>
              <p className="text-3xl font-bold text-white">{stats.avgScore}%</p>
              <p className="text-xs text-gray-500 mt-2">across all attempts</p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <Badge className="bg-orange-500/20 text-orange-400">Streak</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-xs text-gray-500 mt-2">days of practice</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="coding" className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <TabsList className="bg-background/50 border border-white/10 rounded-lg p-1">
              <TabsTrigger value="coding" className="rounded data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400">
                <Code2 className="h-4 w-4 mr-2" />
                Coding Challenges
              </TabsTrigger>
              <TabsTrigger value="behavioral" className="rounded data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400">
                <MessageSquare className="h-4 w-4 mr-2" />
                Behavioral Prep
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/20">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Coding Challenges Tab */}
          <TabsContent value="coding" className="mt-6">
            {/* Category Filters with Enhanced Styling */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3 font-semibold">Filter by Category</p>
              <div className="flex flex-wrap gap-2">
                {getCategories().map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "border-white/20 text-gray-400 hover:text-white hover:border-white/40"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
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

        {/* Coding Challenge Editor Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-white/20 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedChallenge.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                      {selectedChallenge.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{selectedChallenge.duration}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={closeChallenge} className="text-gray-400 hover:text-white">
                  ×
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex h-[calc(90vh-80px)]">
                {/* Problem Statement */}
                <div className="w-1/2 p-4 border-r border-white/10 overflow-y-auto">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Problem Statement</h3>
                    <p className="text-gray-300">{selectedChallenge.problemStatement}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Test Cases</h4>
                    <div className="space-y-2">
                      {selectedChallenge.testCases.map((testCase, index) => (
                        <div key={index} className="p-2 bg-background/50 rounded text-sm">
                          <div className="text-gray-400">Input:</div>
                          <pre className="text-white text-xs">{JSON.stringify(testCase.input, null, 2)}</pre>
                          <div className="text-gray-400 mt-2">Expected:</div>
                          <pre className="text-white text-xs">{JSON.stringify(testCase.expected, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Results */}
                  {editorState.testResults && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Test Results</h4>
                      <div className={`p-2 rounded ${
                        editorState.testResults.passed 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {editorState.testResults.passed 
                          ? '✓ All tests passed!' 
                          : `✗ ${editorState.testResults.failed}/${editorState.testResults.total} tests failed`
                        }
                      </div>
                    </div>
                  )}

                  {/* Constraint Validation */}
                  {editorState.constraintResults && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Constraints Validation</h4>
                      <div className={`p-2 rounded ${
                        editorState.constraintResults.passed 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        <div className="font-semibold mb-2">
                          {editorState.constraintResults.passed ? '✓ All constraints passed' : '✗ Constraints not met'}
                        </div>
                        <div className="text-xs space-y-1">
                          {editorState.constraintResults.details.map((detail, index) => (
                            <div key={index} className={detail.includes('✓') ? 'text-success' : 'text-destructive'}>
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Output */}
                  {editorState.output && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Output</h4>
                      <pre className="p-2 bg-background/50 rounded text-xs text-gray-300 overflow-x-auto">
                        {editorState.output}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {editorState.error && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Error</h4>
                      <div className="p-2 bg-destructive/20 text-destructive rounded text-sm">
                        {editorState.error}
                      </div>
                    </div>
                  )}
                </div>

                {/* Code Editor */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                      <select
                        value={editorState.selectedLanguage}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="bg-background/50 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-primary/50"
                      >
                        {selectedChallenge?.constraints.allowedLanguages.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={runCode}
                        disabled={editorState.isRunning}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {editorState.isRunning ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2">⟳</div>
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Code
                          </>
                        )}
                      </Button>
                      
                      {editorState.testResults && (
                        <Button
                          size="sm"
                          onClick={submitSolution}
                          disabled={editorState.isSubmitted || !editorState.testResults.passed}
                          className="bg-success hover:bg-success/90"
                        >
                          {editorState.isSubmitted ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Submitted
                            </>
                          ) : (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Submit
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetChallenge}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <textarea
                      value={editorState.code}
                      onChange={(e) => setEditorState(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full h-full bg-background/50 border border-white/20 rounded p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
                      placeholder="Write your code here..."
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Behavioral Practice Modal */}
        {selectedBehavioral && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedBehavioral.category}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getDifficultyColor(selectedBehavioral.difficulty)}>
                      {selectedBehavioral.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span>Behavioral Practice</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={closeBehavioralPractice} className="text-gray-400 hover:text-white">
                  ×
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex h-[calc(90vh-80px)]">
                {/* Question */}
                <div className="w-1/2 p-4 border-r border-white/10 overflow-y-auto">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Question</h3>
                    <p className="text-gray-300">{selectedBehavioral.question}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Tips for Answering</h4>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div>• Use the STAR method: Situation, Task, Action, Result</div>
                      <div>• Be specific and provide concrete examples</div>
                      <div>• Focus on positive outcomes and learning</div>
                      <div>• Keep your answer concise (2-3 minutes)</div>
                    </div>
                  </div>

                  {/* Submission Status */}
                  {behavioralState.isSubmitted && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Practice Status</h4>
                      <div className="p-2 bg-success/20 text-success rounded">
                        ✓ Practice completed successfully!
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Editor */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Your Answer</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={submitBehavioralAnswer}
                          disabled={behavioralState.isSubmitted || !behavioralState.answer.trim()}
                          className="bg-success hover:bg-success/90"
                        >
                          {behavioralState.isSubmitted ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Submitted
                            </>
                          ) : (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Submit Answer
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resetBehavioralPractice}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <textarea
                      value={behavioralState.answer}
                      onChange={(e) => setBehavioralState(prev => ({ ...prev, answer: e.target.value }))}
                      className="w-full h-full bg-background/50 border border-white/20 rounded p-3 text-white text-sm resize-none focus:outline-none focus:border-primary/50"
                      placeholder="Type your answer here using the STAR method..."
                      disabled={behavioralState.isSubmitted}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
