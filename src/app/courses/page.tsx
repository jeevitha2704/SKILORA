'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Target,
  ArrowRight,
  PlayCircle,
  Lock,
  Zap,
  Users,
  Award,
  Briefcase
} from 'lucide-react'

interface CourseModule {
  id: string
  title: string
  description: string
  duration: string
  topicsCovered: string[]
}

interface Course {
  id: string
  model: number
  title: string
  description: string
  longDescription: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  skills: string[]
  modules: CourseModule[]
  prerequisites: string[]
  learningOutcomes: string[]
  icon: any
  color: string
  isCompleted: boolean
}

const COURSES: Course[] = [
  {
    id: 'model-1',
    model: 1,
    title: 'JavaScript Fundamentals',
    description: 'Master core JavaScript concepts and build a strong foundation',
    longDescription: 'Learn JavaScript from scratch. This comprehensive course covers variables, data types, functions, objects, arrays, ES6+ features, and functional programming concepts. Perfect for beginners.',
    level: 'Beginner',
    duration: '4 weeks',
    skills: ['JavaScript', 'ES6+', 'DOM Manipulation', 'Async Programming'],
    color: 'from-yellow-500 to-amber-600',
    icon: Code2,
    isCompleted: false,
    prerequisites: ['Basic HTML Knowledge'],
    learningOutcomes: [
      'Understand JavaScript fundamentals and syntax',
      'Master variable scoping and hoisting',
      'Work with functions and closures',
      'Handle asynchronous operations with Promises and async/await',
      'Manipulate DOM and handle events'
    ],
    modules: [
      {
        id: '1-1',
        title: 'JavaScript Basics & Syntax',
        description: 'Variables, data types, operators, and control flow',
        duration: '3 days',
        topicsCovered: ['Variables (var, let, const)', 'Data Types', 'Operators', 'Control Flow']
      },
      {
        id: '1-2',
        title: 'Functions & Scope',
        description: 'Function declarations, expressions, scope, and closures',
        duration: '3 days',
        topicsCovered: ['Function Declarations', 'Function Expressions', 'Arrow Functions', 'Scope & Closures']
      },
      {
        id: '1-3',
        title: 'Objects & Arrays',
        description: 'Working with objects, arrays, and data structures',
        duration: '3 days',
        topicsCovered: ['Object Literals', 'Array Methods', 'Destructuring', 'Spread Operator']
      },
      {
        id: '1-4',
        title: 'ES6+ Modern Features',
        description: 'Classes, modules, and modern JavaScript features',
        duration: '3 days',
        topicsCovered: ['Classes & Inheritance', 'Modules', 'Template Literals', 'Default Parameters']
      },
      {
        id: '1-5',
        title: 'DOM & Events',
        description: 'DOM manipulation and event handling',
        duration: '3 days',
        topicsCovered: ['DOM Selectors', 'DOM Manipulation', 'Event Listeners', 'Event Delegation']
      },
      {
        id: '1-6',
        title: 'Async JavaScript',
        description: 'Promises, async/await, and asynchronous programming',
        duration: '3 days',
        topicsCovered: ['Callbacks', 'Promises', 'Async/Await', 'Error Handling']
      },
      {
        id: '1-7',
        title: 'Project & Best Practices',
        description: 'Build a project and learn JavaScript best practices',
        duration: '4 days',
        topicsCovered: ['Code Quality', 'Debugging', 'Performance', 'Project Structure']
      }
    ]
  },
  {
    id: 'model-2',
    model: 2,
    title: 'TypeScript Mastery',
    description: 'Learn type-safe development with TypeScript',
    longDescription: 'Become proficient in TypeScript. This course covers types, interfaces, generics, advanced typing, and real-world TypeScript patterns for building scalable applications.',
    level: 'Intermediate',
    duration: '3 weeks',
    skills: ['TypeScript', 'Type Safety', 'Generics', 'Advanced Types'],
    color: 'from-blue-500 to-cyan-600',
    icon: Target,
    isCompleted: false,
    prerequisites: ['JavaScript Fundamentals'],
    learningOutcomes: [
      'Understand TypeScript type system',
      'Write type-safe code with interfaces and types',
      'Master generics and advanced typing',
      'Use TypeScript in real-world projects',
      'Integrate TypeScript with modern frameworks'
    ],
    modules: [
      {
        id: '2-1',
        title: 'TypeScript Basics & Setup',
        description: 'Introduction to TypeScript and project setup',
        duration: '2 days',
        topicsCovered: ['What is TypeScript', 'Installation & Setup', 'tsconfig.json', 'Basic Types']
      },
      {
        id: '2-2',
        title: 'Types & Interfaces',
        description: 'Type annotations and interface definitions',
        duration: '3 days',
        topicsCovered: ['Type Annotations', 'Interfaces', 'Type Aliases', 'Structural Typing']
      },
      {
        id: '2-3',
        title: 'Generics & Advanced Types',
        description: 'Generics, utility types, and conditional types',
        duration: '3 days',
        topicsCovered: ['Generics', 'Utility Types', 'Conditional Types', 'Mapped Types']
      },
      {
        id: '2-4',
        title: 'Classes & OOP',
        description: 'Object-oriented programming with TypeScript',
        duration: '3 days',
        topicsCovered: ['Classes', 'Inheritance', 'Access Modifiers', 'Decorators']
      },
      {
        id: '2-5',
        title: 'TypeScript with React',
        description: 'Using TypeScript in React applications',
        duration: '3 days',
        topicsCovered: ['React Component Types', 'Props Typing', 'Hooks with TypeScript', 'Redux Types']
      },
      {
        id: '2-6',
        title: 'Error Handling & Validation',
        description: 'Error handling patterns and input validation',
        duration: '2 days',
        topicsCovered: ['Error Handling', 'Type Guards', 'Validation Libraries', 'Runtime Checking']
      },
      {
        id: '2-7',
        title: 'Best Practices & Project',
        description: 'TypeScript best practices and real-world project',
        duration: '3 days',
        topicsCovered: ['Code Quality', 'Performance', 'Testing', 'Production Patterns']
      }
    ]
  },
  {
    id: 'model-3',
    model: 3,
    title: 'React Fundamentals & Advanced Patterns',
    description: 'Build modern UIs with React and master advanced patterns',
    longDescription: 'Complete React training from basics to advanced patterns. Learn components, hooks, state management, routing, and build production-ready applications.',
    level: 'Intermediate',
    duration: '4 weeks',
    skills: ['React', 'Hooks', 'State Management', 'Component Patterns'],
    color: 'from-cyan-500 to-blue-600',
    icon: Users,
    isCompleted: false,
    prerequisites: ['JavaScript Fundamentals', 'TypeScript Basics'],
    learningOutcomes: [
      'Build functional components with React',
      'Master React hooks and custom hooks',
      'Implement state management solutions',
      'Build scalable application architectures',
      'Optimize React performance',
      'Implement advanced patterns and best practices'
    ],
    modules: [
      {
        id: '3-1',
        title: 'React Basics',
        description: 'JSX, components, and basic React concepts',
        duration: '3 days',
        topicsCovered: ['JSX', 'Components', 'Props', 'Rendering']
      },
      {
        id: '3-2',
        title: 'Hooks & State Management',
        description: 'useState, useEffect, and custom hooks',
        duration: '3 days',
        topicsCovered: ['useState', 'useEffect', 'useContext', 'Custom Hooks']
      },
      {
        id: '3-3',
        title: 'Advanced Hooks',
        description: 'useReducer, useCallback, useMemo, and optimization',
        duration: '3 days',
        topicsCovered: ['useReducer', 'useCallback', 'useMemo', 'Performance Optimization']
      },
      {
        id: '3-4',
        title: 'Component Patterns',
        description: 'Compound components, render props, and HOCs',
        duration: '3 days',
        topicsCovered: ['Compound Components', 'Render Props', 'Higher-Order Components', 'Context API']
      },
      {
        id: '3-5',
        title: 'Routing & Navigation',
        description: 'React Router for SPA navigation',
        duration: '2 days',
        topicsCovered: ['React Router', 'Routes & Links', 'Dynamic Routing', 'Nested Routes']
      },
      {
        id: '3-6',
        title: 'Form Handling',
        description: 'Controlled components and form validation',
        duration: '2 days',
        topicsCovered: ['Controlled Components', 'Form Validation', 'Form Libraries', 'Accessibility']
      },
      {
        id: '3-7',
        title: 'API Integration & Project',
        description: 'Fetch API, error handling, and building projects',
        duration: '4 days',
        topicsCovered: ['Fetch API', 'Error Handling', 'Data Fetching', 'Real-world Project']
      }
    ]
  },
  {
    id: 'model-4',
    model: 4,
    title: 'State Management & Redux',
    description: 'Master state management with Redux and advanced patterns',
    longDescription: 'Deep dive into state management. Learn Redux, Redux Toolkit, middleware, side effects, and how to structure complex applications.',
    level: 'Advanced',
    duration: '3 weeks',
    skills: ['Redux', 'State Management', 'Middleware', 'Redux Toolkit'],
    color: 'from-purple-500 to-pink-600',
    icon: Zap,
    isCompleted: false,
    prerequisites: ['React Fundamentals'],
    learningOutcomes: [
      'Understand state management principles',
      'Implement Redux in applications',
      'Use Redux Toolkit for modern Redux',
      'Handle side effects with middleware',
      'Optimize Redux performance',
      'Implement complex state patterns'
    ],
    modules: [
      {
        id: '4-1',
        title: 'Redux Fundamentals',
        description: 'Actions, reducers, and store concepts',
        duration: '3 days',
        topicsCovered: ['Redux Principles', 'Actions', 'Reducers', 'Store Setup']
      },
      {
        id: '4-2',
        title: 'Redux with React',
        description: 'Connecting React to Redux',
        duration: '3 days',
        topicsCovered: ['React-Redux', 'Connect API', 'Hooks (useSelector, useDispatch)', 'Provider']
      },
      {
        id: '4-3',
        title: 'Redux Toolkit',
        description: 'Modern Redux with Redux Toolkit',
        duration: '3 days',
        topicsCovered: ['Redux Toolkit Setup', 'createSlice', 'createAsyncThunk', 'RTK Query']
      },
      {
        id: '4-4',
        title: 'Middleware & Side Effects',
        description: 'Redux middleware and async operations',
        duration: '3 days',
        topicsCovered: ['Middleware Concept', 'Redux Thunk', 'Redux Saga', 'Side Effects']
      },
      {
        id: '4-5',
        title: 'Selectors & Normalization',
        description: 'Reselect and state normalization',
        duration: '2 days',
        topicsCovered: ['Selector Patterns', 'Reselect Library', 'State Normalization', 'Performance']
      },
      {
        id: '4-6',
        title: 'Testing Redux',
        description: 'Testing actions, reducers, and middleware',
        duration: '2 days',
        topicsCovered: ['Testing Reducers', 'Testing Async Thunks', 'Integration Testing']
      },
      {
        id: '4-7',
        title: 'Complex Patterns & Project',
        description: 'Advanced patterns and large-scale application',
        duration: '3 days',
        topicsCovered: ['Complex State Patterns', 'Performance Optimization', 'Real-world Project']
      }
    ]
  },
  {
    id: 'model-5',
    model: 5,
    title: 'Backend Development with Node.js & Express',
    description: 'Build scalable backend applications',
    longDescription: 'Create production-ready backend applications with Node.js and Express. Learn routing, middleware, authentication, database integration, and deployment.',
    level: 'Intermediate',
    duration: '4 weeks',
    skills: ['Node.js', 'Express', 'REST APIs', 'Database Integration'],
    color: 'from-green-500 to-emerald-600',
    icon: Briefcase,
    isCompleted: false,
    prerequisites: ['JavaScript Fundamentals'],
    learningOutcomes: [
      'Build HTTP servers with Node.js',
      'Create RESTful APIs with Express',
      'Implement authentication and authorization',
      'Integrate with databases',
      'Handle errors and validation',
      'Deploy Node.js applications'
    ],
    modules: [
      {
        id: '5-1',
        title: 'Node.js Fundamentals',
        description: 'Node.js basics and core modules',
        duration: '3 days',
        topicsCovered: ['Node.js Runtime', 'Core Modules', 'NPM Packages', 'File System']
      },
      {
        id: '5-2',
        title: 'Express Setup & Routing',
        description: 'Express server setup and routing',
        duration: '3 days',
        topicsCovered: ['Express Setup', 'Routing', 'HTTP Methods', 'Route Parameters']
      },
      {
        id: '5-3',
        title: 'Middleware & Request Handling',
        description: 'Middleware, body parsing, and request handling',
        duration: '3 days',
        topicsCovered: ['Middleware', 'Body Parsing', 'Error Handling', 'Logging']
      },
      {
        id: '5-4',
        title: 'Authentication & Security',
        description: 'JWT, session management, and security practices',
        duration: '3 days',
        topicsCovered: ['JWT', 'Sessions', 'Password Hashing', 'CORS & Security']
      },
      {
        id: '5-5',
        title: 'Database Integration',
        description: 'SQL and NoSQL database integration',
        duration: '3 days',
        topicsCovered: ['SQL Databases', 'NoSQL (MongoDB)', 'ORMs', 'Database Design']
      },
      {
        id: '5-6',
        title: 'API Design & Validation',
        description: 'RESTful API design and input validation',
        duration: '2 days',
        topicsCovered: ['API Design', 'Request Validation', 'Status Codes', 'Documentation']
      },
      {
        id: '5-7',
        title: 'Testing & Deployment',
        description: 'Testing and deploying Node.js applications',
        duration: '4 days',
        topicsCovered: ['Unit Testing', 'API Testing', 'Deployment', 'Monitoring']
      }
    ]
  },
  {
    id: 'model-6',
    model: 6,
    title: 'Database Design & SQL Mastery',
    description: 'Design and optimize databases with SQL',
    longDescription: 'Master database design principles and SQL. Learn normalization, optimization, indexing, and work with both SQL and NoSQL databases.',
    level: 'Intermediate',
    duration: '3 weeks',
    skills: ['SQL', 'Database Design', 'Optimization', 'Data Modeling'],
    color: 'from-red-500 to-orange-600',
    icon: Award,
    isCompleted: false,
    prerequisites: [],
    learningOutcomes: [
      'Design relational databases',
      'Write efficient SQL queries',
      'Understand database optimization',
      'Implement proper indexing',
      'Normalize database schemas',
      'Work with SQL and NoSQL databases'
    ],
    modules: [
      {
        id: '6-1',
        title: 'Database Fundamentals',
        description: 'Database concepts and relational model',
        duration: '2 days',
        topicsCovered: ['Database Concepts', 'Relational Model', 'Tables & Keys', 'Relationships']
      },
      {
        id: '6-2',
        title: 'SQL Basics & Queries',
        description: 'SQL syntax and basic queries',
        duration: '3 days',
        topicsCovered: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT & OFFSET']
      },
      {
        id: '6-3',
        title: 'Advanced SQL',
        description: 'JOINs, subqueries, and aggregation',
        duration: '3 days',
        topicsCovered: ['JOINS (INNER, LEFT, RIGHT)', 'Subqueries', 'GROUP BY', 'Aggregation']
      },
      {
        id: '6-4',
        title: 'Database Normalization',
        description: 'Normalization forms and schema design',
        duration: '3 days',
        topicsCovered: ['1NF, 2NF, 3NF', 'BCNF', 'Denormalization', 'Design Patterns']
      },
      {
        id: '6-5',
        title: 'Indexing & Optimization',
        description: 'Query optimization and indexing strategies',
        duration: '3 days',
        topicsCovered: ['Query Plans', 'Index Types', 'Performance Tuning', 'Statistics']
      },
      {
        id: '6-6',
        title: 'NoSQL Databases',
        description: 'MongoDB and document-based databases',
        duration: '2 days',
        topicsCovered: ['MongoDB Basics', 'Document Model', 'Aggregation', 'Indexing NoSQL']
      },
      {
        id: '6-7',
        title: 'Transactions & Advanced Topics',
        description: 'ACID properties and advanced database concepts',
        duration: '3 days',
        topicsCovered: ['Transactions', 'ACID Properties', 'Concurrency', 'Backup & Recovery']
      }
    ]
  },
  {
    id: 'model-7',
    model: 7,
    title: 'Testing & Quality Assurance',
    description: 'Write tests and ensure code quality',
    longDescription: 'Master testing practices. Learn unit testing, integration testing, E2E testing, and quality assurance practices for reliable applications.',
    level: 'Intermediate',
    duration: '3 weeks',
    skills: ['Jest', 'React Testing', 'E2E Testing', 'Code Quality'],
    color: 'from-indigo-500 to-purple-600',
    icon: CheckCircle2,
    isCompleted: false,
    prerequisites: ['JavaScript Fundamentals', 'React Basics'],
    learningOutcomes: [
      'Write unit tests with Jest',
      'Test React components',
      'Implement integration tests',
      'Write E2E tests with Playwright',
      'Understand testing best practices',
      'Achieve high code coverage'
    ],
    modules: [
      {
        id: '7-1',
        title: 'Testing Fundamentals',
        description: 'Testing concepts and Jest setup',
        duration: '2 days',
        topicsCovered: ['Testing Types', 'Jest Setup', 'Assertions', 'Test Structure']
      },
      {
        id: '7-2',
        title: 'Unit Testing',
        description: 'Unit testing functions and modules',
        duration: '3 days',
        topicsCovered: ['Pure Function Testing', 'Mocks', 'Stubs', 'Spies']
      },
      {
        id: '7-3',
        title: 'React Component Testing',
        description: 'Testing React components with React Testing Library',
        duration: '3 days',
        topicsCovered: ['React Testing Library', 'Queries', 'User Events', 'Async Testing']
      },
      {
        id: '7-4',
        title: 'Advanced Testing Patterns',
        description: 'Snapshot testing, custom hooks testing',
        duration: '2 days',
        topicsCovered: ['Snapshot Testing', 'Custom Hooks', 'Context Testing', 'Redux Testing']
      },
      {
        id: '7-5',
        title: 'Integration Testing',
        description: 'Testing multiple components together',
        duration: '2 days',
        topicsCovered: ['Integration Tests', 'API Mocking', 'Test Utilities', 'Fixtures']
      },
      {
        id: '7-6',
        title: 'E2E Testing',
        description: 'End-to-end testing with Playwright',
        duration: '2 days',
        topicsCovered: ['Playwright Setup', 'Selectors', 'User Flows', 'CI Integration']
      },
      {
        id: '7-7',
        title: 'Coverage & Best Practices',
        description: 'Code coverage and testing best practices',
        duration: '3 days',
        topicsCovered: ['Coverage Tools', 'Coverage Goals', 'Performance Testing', 'Debugging Tests']
      }
    ]
  },
  {
    id: 'model-8',
    model: 8,
    title: 'Full Stack Project & Deployment',
    description: 'Build and deploy production-ready full-stack applications',
    longDescription: 'Capstone course where you build a complete full-stack application. Learn about architecture, deployment, monitoring, and best practices for production systems.',
    level: 'Advanced',
    duration: '4 weeks',
    skills: ['Full Stack Development', 'DevOps', 'Deployment', 'System Design'],
    color: 'from-pink-500 to-rose-600',
    icon: Briefcase,
    isCompleted: false,
    prerequisites: ['React', 'Node.js', 'Database Design', 'Testing'],
    learningOutcomes: [
      'Design full-stack applications',
      'Implement complete CRUD applications',
      'Deploy applications to production',
      'Monitor and maintain applications',
      'Optimize performance at scale',
      'Apply software engineering best practices'
    ],
    modules: [
      {
        id: '8-1',
        title: 'Project Planning & Architecture',
        description: 'System design and application architecture',
        duration: '3 days',
        topicsCovered: ['Requirements Analysis', 'System Design', 'Architecture Patterns', 'Tech Stack']
      },
      {
        id: '8-2',
        title: 'Frontend Development',
        description: 'Build scalable frontend with React and TypeScript',
        duration: '5 days',
        topicsCovered: ['Component Architecture', 'State Management', 'Routing', 'UI/UX Best Practices']
      },
      {
        id: '8-3',
        title: 'Backend Development',
        description: 'Build robust APIs with Node.js',
        duration: '5 days',
        topicsCovered: ['API Design', 'Database Integration', 'Authentication', 'Error Handling']
      },
      {
        id: '8-4',
        title: 'Database Implementation',
        description: 'Implement and optimize databases',
        duration: '3 days',
        topicsCovered: ['Schema Design', 'Migrations', 'Indexing', 'Query Optimization']
      },
      {
        id: '8-5',
        title: 'Testing & Quality',
        description: 'Comprehensive testing strategy',
        duration: '4 days',
        topicsCovered: ['Unit Tests', 'Integration Tests', 'E2E Tests', 'Code Quality']
      },
      {
        id: '8-6',
        title: 'Deployment & DevOps',
        description: 'Deploy to production with CI/CD',
        duration: '4 days',
        topicsCovered: ['Docker', 'CI/CD', 'Cloud Deployment', 'Environment Management']
      },
      {
        id: '8-7',
        title: 'Monitoring & Performance',
        description: 'Monitor, debug, and optimize production systems',
        duration: '4 days',
        topicsCovered: ['Logging', 'Error Tracking', 'Performance Monitoring', 'Scaling']
      }
    ]
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  useEffect(() => {
    // Load completed courses from localStorage
    const saved = localStorage.getItem('completedCourses')
    if (saved) {
      setCompletedCourses(JSON.parse(saved))
    }
  }, [])

  const handleStartCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleCompleteCourse = (courseId: string) => {
    if (!completedCourses.includes(courseId)) {
      const updated = [...completedCourses, courseId]
      setCompletedCourses(updated)
      localStorage.setItem('completedCourses', JSON.stringify(updated))
    }
  }

  const getCompletionPercentage = () => {
    return Math.round((completedCourses.length / COURSES.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Professional Learning Paths</h1>
              <p className="text-gray-400">Master in-demand skills with structured courses</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                {completedCourses.length}/{COURSES.length}
              </div>
              <p className="text-gray-400 text-sm">Courses Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">{getCompletionPercentage()}% Complete</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course) => {
            const isCompleted = completedCourses.includes(course.id)
            const Icon = course.icon

            return (
              <Card
                key={course.id}
                className={`glass border-white/10 hover:border-white/20 transition-all overflow-hidden group cursor-pointer ${
                  isCompleted ? 'border-green-500/30' : ''
                }`}
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              >
                <div
                  className={`bg-gradient-to-r ${course.color} h-32 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center">
                    <Icon className="h-20 w-20 text-white opacity-50" />
                  </div>
                  {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 rounded-full p-2">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4">
                    <Badge className="bg-white/20 text-white border-0 mb-2">Model {course.model}</Badge>
                    <h3 className="text-white font-bold text-lg">{course.title}</h3>
                  </div>
                </div>

                <CardContent className="p-5">
                  <p className="text-gray-300 text-sm mb-4">{course.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Target className="h-4 w-4 mr-2" />
                      {course.level}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-xs font-semibold mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} className="bg-blue-500/30 text-blue-200 border-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-white font-semibold text-sm mb-3">Learning Outcomes</h4>
                      <ul className="space-y-2">
                        {course.learningOutcomes.slice(0, 3).map((outcome, i) => (
                          <li key={i} className="flex items-start text-gray-300 text-xs">
                            <span className="text-green-400 mr-2">✓</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-gray-400 text-xs mt-3">{course.modules.length} modules · {course.modules.reduce((acc, m) => acc + (parseInt(m.duration) || 0), 0)} hours of content</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleStartCourse(course.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Course
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
