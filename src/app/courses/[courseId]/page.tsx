'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  ArrowLeft,
  PlayCircle,
  Lock,
  Zap,
  Award,
  AlertCircle,
  Code2,
  Circle,
  Trophy,
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
}

// Import all courses data
const COURSES_MAP: Record<string, Course> = {
  'model-1': {
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
    prerequisites: ['Basic HTML Knowledge'],
    learningOutcomes: [
      'Understand JavaScript fundamentals and syntax',
      'Master variable scoping and hoisting',
      'Work with functions and closures',
      'Handle asynchronous operations with Promises and async/await',
      'Manipulate DOM and handle events',
      'Build interactive web applications'
    ],
    modules: [
      {
        id: '1-1',
        title: 'JavaScript Basics & Syntax',
        description: 'Variables, data types, operators, and control flow. Learn how to write basic JavaScript code and understand fundamental programming concepts.',
        duration: '3 days',
        topicsCovered: ['Variables (var, let, const)', 'Data Types', 'Operators', 'Control Flow', 'Conditional Statements', 'Loops']
      },
      {
        id: '1-2',
        title: 'Functions & Scope',
        description: 'Function declarations, expressions, scope, and closures. Master function concepts and understand JavaScript scope chain.',
        duration: '3 days',
        topicsCovered: ['Function Declarations', 'Function Expressions', 'Arrow Functions', 'Scope & Closures', 'Higher-Order Functions']
      },
      {
        id: '1-3',
        title: 'Objects & Arrays',
        description: 'Working with objects, arrays, and data structures. Learn how to manipulate and work with complex data types.',
        duration: '3 days',
        topicsCovered: ['Object Literals', 'Array Methods (map, filter, reduce)', 'Destructuring', 'Spread Operator', 'Rest Parameters']
      },
      {
        id: '1-4',
        title: 'ES6+ Modern Features',
        description: 'Classes, modules, and modern JavaScript features. Learn about the latest JavaScript standards.',
        duration: '3 days',
        topicsCovered: ['Classes & Inheritance', 'Modules (import/export)', 'Template Literals', 'Default Parameters', 'Destructuring Assignment']
      },
      {
        id: '1-5',
        title: 'DOM & Events',
        description: 'DOM manipulation and event handling. Learn how to interact with HTML elements from JavaScript.',
        duration: '3 days',
        topicsCovered: ['DOM Selectors', 'DOM Manipulation', 'Event Listeners', 'Event Delegation', 'Event Handling Best Practices']
      },
      {
        id: '1-6',
        title: 'Async JavaScript',
        description: 'Promises, async/await, and asynchronous programming. Master asynchronous code patterns.',
        duration: '3 days',
        topicsCovered: ['Callbacks', 'Promises', 'Async/Await', 'Error Handling', 'Promise.all and Promise.race']
      },
      {
        id: '1-7',
        title: 'Project & Best Practices',
        description: 'Build a project and learn JavaScript best practices. Apply everything you learned in a real-world project.',
        duration: '4 days',
        topicsCovered: ['Code Quality', 'Debugging', 'Performance', 'Project Structure', 'Version Control with Git']
      }
    ]
  },
  'model-2': {
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
    prerequisites: ['JavaScript Fundamentals'],
    learningOutcomes: [
      'Understand TypeScript type system',
      'Write type-safe code with interfaces and types',
      'Master generics and advanced typing',
      'Use TypeScript in real-world projects',
      'Integrate TypeScript with modern frameworks',
      'Optimize TypeScript compilation'
    ],
    modules: [
      {
        id: '2-1',
        title: 'TypeScript Basics & Setup',
        description: 'Introduction to TypeScript and project setup. Install TypeScript and configure your development environment.',
        duration: '2 days',
        topicsCovered: ['What is TypeScript', 'Installation & Setup', 'tsconfig.json Configuration', 'Basic Types', 'Type Inference']
      },
      {
        id: '2-2',
        title: 'Types & Interfaces',
        description: 'Type annotations and interface definitions. Learn how to define types for your JavaScript code.',
        duration: '3 days',
        topicsCovered: ['Type Annotations', 'Interfaces', 'Type Aliases', 'Structural Typing', 'Optional and Readonly']
      },
      {
        id: '2-3',
        title: 'Generics & Advanced Types',
        description: 'Generics, utility types, and conditional types. Master advanced typing patterns.',
        duration: '3 days',
        topicsCovered: ['Generics', 'Utility Types (Partial, Pick, Record)', 'Conditional Types', 'Mapped Types', 'Type Guards']
      },
      {
        id: '2-4',
        title: 'Classes & OOP',
        description: 'Object-oriented programming with TypeScript. Learn how to use classes effectively.',
        duration: '3 days',
        topicsCovered: ['Classes', 'Inheritance', 'Access Modifiers (public, private, protected)', 'Abstract Classes', 'Interfaces']
      },
      {
        id: '2-5',
        title: 'TypeScript with React',
        description: 'Using TypeScript in React applications. Type your React components and hooks.',
        duration: '3 days',
        topicsCovered: ['React Component Types', 'Props Typing', 'Hooks with TypeScript', 'Redux Types', 'Context API Types']
      },
      {
        id: '2-6',
        title: 'Error Handling & Validation',
        description: 'Error handling patterns and input validation. Write robust TypeScript code.',
        duration: '2 days',
        topicsCovered: ['Error Handling', 'Type Guards', 'Validation Libraries', 'Runtime Checking', 'Error Types']
      },
      {
        id: '2-7',
        title: 'Best Practices & Project',
        description: 'TypeScript best practices and real-world project. Build a production-ready TypeScript application.',
        duration: '3 days',
        topicsCovered: ['Code Quality', 'Performance', 'Testing TypeScript', 'Production Patterns', 'Debugging']
      }
    ]
  },
  'model-3': {
    id: 'model-3',
    model: 3,
    title: 'React Fundamentals & Advanced Patterns',
    description: 'Build modern UIs with React and master advanced patterns',
    longDescription: 'Complete React training from basics to advanced patterns. Learn components, hooks, state management, routing, and build production-ready applications.',
    level: 'Intermediate',
    duration: '4 weeks',
    skills: ['React', 'Hooks', 'State Management', 'Component Patterns'],
    color: 'from-cyan-500 to-blue-600',
    icon: Code2,
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
        description: 'JSX, components, and basic React concepts. Start building with React.',
        duration: '3 days',
        topicsCovered: ['JSX Syntax', 'Functional Components', 'Props', 'Rendering Lists', 'Conditional Rendering']
      },
      {
        id: '3-2',
        title: 'Hooks & State Management',
        description: 'useState, useEffect, and custom hooks. Learn modern React state management.',
        duration: '3 days',
        topicsCovered: ['useState Hook', 'useEffect Hook', 'useContext Hook', 'Custom Hooks', 'Hook Rules']
      },
      {
        id: '3-3',
        title: 'Advanced Hooks',
        description: 'useReducer, useCallback, useMemo, and optimization. Optimize React applications.',
        duration: '3 days',
        topicsCovered: ['useReducer Hook', 'useCallback Hook', 'useMemo Hook', 'Performance Optimization', 'Memoization']
      },
      {
        id: '3-4',
        title: 'Component Patterns',
        description: 'Compound components, render props, and HOCs. Learn advanced component patterns.',
        duration: '3 days',
        topicsCovered: ['Compound Components', 'Render Props Pattern', 'Higher-Order Components', 'Context API Advanced']
      },
      {
        id: '3-5',
        title: 'Routing & Navigation',
        description: 'React Router for SPA navigation. Build multi-page applications.',
        duration: '2 days',
        topicsCovered: ['React Router Setup', 'Routes & Links', 'Dynamic Routing', 'Nested Routes', 'Query Parameters']
      },
      {
        id: '3-6',
        title: 'Form Handling',
        description: 'Controlled components and form validation. Handle user input effectively.',
        duration: '2 days',
        topicsCovered: ['Controlled Components', 'Form Validation', 'Form Libraries', 'Accessibility', 'File Upload']
      },
      {
        id: '3-7',
        title: 'API Integration & Project',
        description: 'Fetch API, error handling, and building projects. Connect to backend APIs.',
        duration: '4 days',
        topicsCovered: ['Fetch API', 'Error Handling', 'Loading States', 'Real-world Project', 'API Best Practices']
      }
    ]
  },
  'model-4': {
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
        description: 'Actions, reducers, and store concepts. Understand Redux architecture.',
        duration: '3 days',
        topicsCovered: ['Redux Principles', 'Actions & Action Creators', 'Reducers', 'Store Setup', 'Redux Devtools']
      },
      {
        id: '4-2',
        title: 'Redux with React',
        description: 'Connecting React to Redux. Integrate Redux into React applications.',
        duration: '3 days',
        topicsCovered: ['React-Redux Library', 'Connect API', 'Hooks (useSelector, useDispatch)', 'Provider Setup']
      },
      {
        id: '4-3',
        title: 'Redux Toolkit',
        description: 'Modern Redux with Redux Toolkit. Simplify Redux with RTK.',
        duration: '3 days',
        topicsCovered: ['Redux Toolkit Setup', 'createSlice Function', 'createAsyncThunk', 'RTK Query', 'Immer Integration']
      },
      {
        id: '4-4',
        title: 'Middleware & Side Effects',
        description: 'Redux middleware and async operations. Handle side effects in Redux.',
        duration: '3 days',
        topicsCovered: ['Middleware Concept', 'Redux Thunk', 'Redux Saga', 'Async Operations', 'Error Handling']
      },
      {
        id: '4-5',
        title: 'Selectors & Normalization',
        description: 'Reselect and state normalization. Optimize Redux state and selectors.',
        duration: '2 days',
        topicsCovered: ['Selector Patterns', 'Reselect Library', 'State Normalization', 'Performance Optimization']
      },
      {
        id: '4-6',
        title: 'Testing Redux',
        description: 'Testing actions, reducers, and middleware. Write tests for Redux code.',
        duration: '2 days',
        topicsCovered: ['Testing Reducers', 'Testing Async Thunks', 'Integration Testing', 'Mocking Redux']
      },
      {
        id: '4-7',
        title: 'Complex Patterns & Project',
        description: 'Advanced patterns and large-scale application. Build real-world Redux applications.',
        duration: '3 days',
        topicsCovered: ['Complex State Patterns', 'Performance Optimization', 'Large-scale Applications', 'Real-world Project']
      }
    ]
  },
  'model-5': {
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
        description: 'Node.js basics and core modules. Get started with Node.js development.',
        duration: '3 days',
        topicsCovered: ['Node.js Runtime', 'Core Modules (fs, path, http)', 'NPM Packages', 'File System Operations']
      },
      {
        id: '5-2',
        title: 'Express Setup & Routing',
        description: 'Express server setup and routing. Create your first Express application.',
        duration: '3 days',
        topicsCovered: ['Express Setup', 'Basic Routing', 'HTTP Methods (GET, POST, PUT, DELETE)', 'Route Parameters', 'Query Strings']
      },
      {
        id: '5-3',
        title: 'Middleware & Request Handling',
        description: 'Middleware, body parsing, and request handling. Process HTTP requests effectively.',
        duration: '3 days',
        topicsCovered: ['Middleware Concept', 'Body Parsing', 'Error Handling', 'Logging Middleware', 'CORS']
      },
      {
        id: '5-4',
        title: 'Authentication & Security',
        description: 'JWT, session management, and security practices. Secure your API.',
        duration: '3 days',
        topicsCovered: ['JWT Tokens', 'Session Management', 'Password Hashing (bcrypt)', 'CORS & Security Headers', 'Rate Limiting']
      },
      {
        id: '5-5',
        title: 'Database Integration',
        description: 'SQL and NoSQL database integration. Connect databases to your API.',
        duration: '3 days',
        topicsCovered: ['SQL Databases (PostgreSQL)', 'NoSQL (MongoDB)', 'ORMs and ODMs', 'Database Transactions', 'Connection Pooling']
      },
      {
        id: '5-6',
        title: 'API Design & Validation',
        description: 'RESTful API design and input validation. Design professional APIs.',
        duration: '2 days',
        topicsCovered: ['RESTful Principles', 'Request Validation', 'HTTP Status Codes', 'Error Responses', 'API Documentation']
      },
      {
        id: '5-7',
        title: 'Testing & Deployment',
        description: 'Testing and deploying Node.js applications. Deploy to production.',
        duration: '4 days',
        topicsCovered: ['Unit Testing (Jest)', 'API Testing', 'Docker Containerization', 'Heroku Deployment', 'Monitoring']
      }
    ]
  },
  'model-6': {
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
        description: 'Database concepts and relational model. Understand database basics.',
        duration: '2 days',
        topicsCovered: ['Database Concepts', 'Relational Model', 'Tables & Keys', 'Relationships & Constraints']
      },
      {
        id: '6-2',
        title: 'SQL Basics & Queries',
        description: 'SQL syntax and basic queries. Write your first SQL queries.',
        duration: '3 days',
        topicsCovered: ['SELECT Statement', 'WHERE Clause', 'ORDER BY', 'LIMIT & OFFSET', 'DISTINCT']
      },
      {
        id: '6-3',
        title: 'Advanced SQL',
        description: 'JOINs, subqueries, and aggregation. Write complex SQL queries.',
        duration: '3 days',
        topicsCovered: ['JOINS (INNER, LEFT, RIGHT, FULL)', 'Subqueries', 'GROUP BY & HAVING', 'Aggregation Functions', 'Window Functions']
      },
      {
        id: '6-4',
        title: 'Database Normalization',
        description: 'Normalization forms and schema design. Design efficient databases.',
        duration: '3 days',
        topicsCovered: ['1NF, 2NF, 3NF, BCNF', 'Denormalization', 'Schema Design Patterns', 'Foreign Keys', 'Referential Integrity']
      },
      {
        id: '6-5',
        title: 'Indexing & Optimization',
        description: 'Query optimization and indexing strategies. Optimize database performance.',
        duration: '3 days',
        topicsCovered: ['Query Plans & EXPLAIN', 'Index Types (B-tree, Hash)', 'Query Optimization', 'Statistics', 'Performance Tuning']
      },
      {
        id: '6-6',
        title: 'NoSQL Databases',
        description: 'MongoDB and document-based databases. Work with NoSQL databases.',
        duration: '2 days',
        topicsCovered: ['MongoDB Basics', 'Document Model', 'CRUD Operations', 'Aggregation Framework', 'Indexing NoSQL']
      },
      {
        id: '6-7',
        title: 'Transactions & Advanced Topics',
        description: 'ACID properties and advanced database concepts. Master database concepts.',
        duration: '3 days',
        topicsCovered: ['ACID Properties', 'Transactions', 'Concurrency Control', 'Locking', 'Backup & Recovery']
      }
    ]
  },
  'model-7': {
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
        description: 'Testing concepts and Jest setup. Start testing your code.',
        duration: '2 days',
        topicsCovered: ['Testing Types (Unit, Integration, E2E)', 'Jest Setup', 'Assertions', 'Test Structure & Naming']
      },
      {
        id: '7-2',
        title: 'Unit Testing',
        description: 'Unit testing functions and modules. Write unit tests effectively.',
        duration: '3 days',
        topicsCovered: ['Testing Pure Functions', 'Mocks & Stubs', 'Spies', 'Snapshot Testing', 'Test Coverage']
      },
      {
        id: '7-3',
        title: 'React Component Testing',
        description: 'Testing React components with React Testing Library. Test React components.',
        duration: '3 days',
        topicsCovered: ['React Testing Library', 'Queries & Selectors', 'User Events', 'Async Testing', 'Mock Data']
      },
      {
        id: '7-4',
        title: 'Advanced Testing Patterns',
        description: 'Snapshot testing, custom hooks testing. Advanced testing techniques.',
        duration: '2 days',
        topicsCovered: ['Custom Hooks Testing', 'Context Testing', 'Redux Testing', 'Redux Hooks Testing']
      },
      {
        id: '7-5',
        title: 'Integration Testing',
        description: 'Testing multiple components together. Test component interactions.',
        duration: '2 days',
        topicsCovered: ['Integration Tests', 'API Mocking (MSW)', 'Test Utilities', 'Fixtures', 'Test Helpers']
      },
      {
        id: '7-6',
        title: 'E2E Testing',
        description: 'End-to-end testing with Playwright. Write E2E tests.',
        duration: '2 days',
        topicsCovered: ['Playwright Setup', 'Selectors & Locators', 'User Flows', 'Debugging E2E Tests', 'CI Integration']
      },
      {
        id: '7-7',
        title: 'Coverage & Best Practices',
        description: 'Code coverage and testing best practices. Test effectively.',
        duration: '3 days',
        topicsCovered: ['Coverage Tools & Reports', 'Coverage Goals', 'Performance Testing', 'Debugging Tests', 'Test Maintenance']
      }
    ]
  },
  'model-8': {
    id: 'model-8',
    model: 8,
    title: 'Full Stack Project & Deployment',
    description: 'Build and deploy production-ready full-stack applications',
    longDescription: 'Capstone course where you build a complete full-stack application. Learn about architecture, deployment, monitoring, and best practices for production systems.',
    level: 'Advanced',
    duration: '4 weeks',
    skills: ['Full Stack Development', 'DevOps', 'Deployment', 'System Design'],
    color: 'from-pink-500 to-rose-600',
    icon: Award,
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
        description: 'System design and application architecture. Plan your application.',
        duration: '3 days',
        topicsCovered: ['Requirements Analysis', 'System Design', 'Architecture Patterns (MVC, MVP)', 'Tech Stack Selection', 'Database Schema']
      },
      {
        id: '8-2',
        title: 'Frontend Development',
        description: 'Build scalable frontend with React and TypeScript. Develop frontend.',
        duration: '5 days',
        topicsCovered: ['Component Architecture', 'State Management Setup', 'Routing Configuration', 'UI/UX Best Practices', 'Responsive Design']
      },
      {
        id: '8-3',
        title: 'Backend Development',
        description: 'Build robust APIs with Node.js. Develop backend.',
        duration: '5 days',
        topicsCovered: ['API Route Setup', 'Database Integration', 'Authentication Implementation', 'Error Handling', 'Validation']
      },
      {
        id: '8-4',
        title: 'Database Implementation',
        description: 'Implement and optimize databases. Set up database.',
        duration: '3 days',
        topicsCovered: ['Schema Design & Migrations', 'Seed Data', 'Indexing & Optimization', 'Relationships & Constraints', 'Backups']
      },
      {
        id: '8-5',
        title: 'Testing & Quality',
        description: 'Comprehensive testing strategy. Test your application.',
        duration: '4 days',
        topicsCovered: ['Unit Test Suite', 'Integration Tests', 'E2E Tests', 'Code Quality Tools', 'Coverage Reports']
      },
      {
        id: '8-6',
        title: 'Deployment & DevOps',
        description: 'Deploy to production with CI/CD. Deploy your application.',
        duration: '4 days',
        topicsCovered: ['Docker Containerization', 'CI/CD Pipeline', 'Cloud Deployment (AWS/Heroku)', 'Environment Configuration', 'Version Control']
      },
      {
        id: '8-7',
        title: 'Monitoring & Performance',
        description: 'Monitor, debug, and optimize production systems. Monitor & maintain.',
        duration: '4 days',
        topicsCovered: ['Logging & Analytics', 'Error Tracking', 'Performance Monitoring', 'Scaling Strategies', 'Post-Deployment Maintenance']
      }
    ]
  }
}

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  const course = COURSES_MAP[courseId]

  useEffect(() => {
    if (!course) {
      router.push('/courses')
    }
  }, [course, router])

  if (!course) {
    return null
  }

  const currentModule = course.modules[currentModuleIndex]
  const completionPercent = Math.round((completedModules.length / course.modules.length) * 100)

  const handleCompleteModule = () => {
    if (!completedModules.includes(currentModule.id)) {
      setCompletedModules([...completedModules, currentModule.id])
    }
  }

  const handleCompleteCourse = () => {
    // Save to localStorage
    const completed = localStorage.getItem('completedCourses') || '[]'
    const list = JSON.parse(completed)
    if (!list.includes(course.id)) {
      list.push(course.id)
      localStorage.setItem('completedCourses', JSON.stringify(list))
    }
    router.push('/courses')
  }

  const canComplete = completedModules.length === course.modules.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Header */}
            <Card className="glass border-white/10 overflow-hidden">
              <div className={`bg-gradient-to-r ${course.color} h-40 relative`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <BookOpen className="h-32 w-32 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <Badge className="mb-3">Model {course.model}</Badge>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-gray-300 mb-4">{course.longDescription}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Level</p>
                    <p className="text-white font-semibold">{course.level}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold">{course.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Modules</p>
                    <p className="text-white font-semibold">{course.modules.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Completion</p>
                    <p className="text-green-400 font-semibold">{completionPercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-white font-semibold">Course Progress</p>
                <p className="text-gray-400 text-sm">
                  {completedModules.length} of {course.modules.length} modules completed
                </p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Module Content */}
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">
                      Module {currentModuleIndex + 1}: {currentModule.title}
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-2">{currentModule.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={completedModules.includes(currentModule.id) ? 'bg-green-500' : 'bg-blue-500'}>
                      {completedModules.includes(currentModule.id) ? '✓ Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    Duration: {currentModule.duration}
                  </h3>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">Topics Covered</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentModule.topicsCovered.map((topic, i) => (
                      <div key={i} className="flex items-start p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-green-400 mr-3 mt-1">✓</span>
                        <span className="text-gray-300 text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <p className="text-blue-200 text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      Complete all modules to finish the course and unlock your certificate!
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {currentModuleIndex > 0 && (
                      <Button
                        onClick={() => setCurrentModuleIndex(currentModuleIndex - 1)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600"
                      >
                        Previous Module
                      </Button>
                    )}
                    <Button
                      onClick={handleCompleteModule}
                      disabled={completedModules.includes(currentModule.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {completedModules.includes(currentModule.id) ? 'Module Completed' : 'Complete Module'}
                    </Button>
                    {currentModuleIndex < course.modules.length - 1 && (
                      <Button
                        onClick={() => setCurrentModuleIndex(currentModuleIndex + 1)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Next Module
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Outcomes */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-400" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {course.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <span className="text-green-400 mr-3 mt-1 font-bold">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Completion */}
            {canComplete && (
              <Card className="glass border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                    Ready to Complete?
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You've completed all modules! Click below to mark this course as completed and unlock your certificate.
                  </p>
                  <Button
                    onClick={handleCompleteCourse}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Complete Course
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Module List */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {course.modules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        index === currentModuleIndex
                          ? 'bg-blue-600/30 border border-blue-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {completedModules.includes(module.id) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {index + 1}. {module.title}
                          </p>
                          <p className="text-gray-400 text-xs">{module.duration}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.skills.map((skill) => (
                    <Badge key={skill} className="w-full justify-start bg-purple-500/30 text-purple-200 border-0">
                      <Zap className="h-3 w-3 mr-2" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
