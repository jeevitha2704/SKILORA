'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  Target,
  Trophy,
  Flame,
  Award,
  Lock,
  BarChart3,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  BookOpen,
  GraduationCap,
  MessageSquare
} from 'lucide-react'

interface SkillProgress {
  name: string
  current: number
  target: number
  category: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  date?: string
}

interface WeeklyActivity {
  day: string
  hours: number
}

interface UserActivity {
  date: string
  minutes_spent: number
  challenges_completed: number
  behavioral_completed: number
}

export default function Progress() {
  const { user } = useAuth()
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Store data for School Progress section
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [practiceData, setPracticeData] = useState<any[]>([])
  const [behavioralData, setBehavioralData] = useState<any[]>([])
  const [roadmapData, setRoadmapData] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadRealProgressData()
      // Track activity immediately and set streak to 1
      trackUserActivity()
    } else {
      setLoading(false)
      // For demo users, show minimal real data
      setSkillProgress([])
      setAchievements([])
      setWeeklyActivity([])
      setCurrentStreak(0)
      setTotalMinutes(0)
    }
  }, [user])

  const loadRealProgressData = async () => {
    try {
      // Get real user activity data
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30) // Last 30 days

      // Get completed challenges from practice sessions
      const { data: practiceData, error: practiceError } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)

      // Get behavioral sessions
      const { data: behavioralData, error: behavioralError } = await supabase
        .from('behavioral_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)

      // Get user skills from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', user?.id)
        .single()
      
      // If profile query fails, try to get skills from a different approach or use default
      let userSkills = profileData?.skills || []
      if (!userSkills || userSkills.length === 0) {
        // Fallback to localStorage or default skills
        userSkills = JSON.parse(localStorage.getItem('userSkills') || '["JavaScript", "TypeScript", "React"]')
      }

      // Get completed roadmap milestones
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('user_roadmap_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)

      // Check if tables exist by looking at errors
      const tablesExist = !activityError && !practiceError && !behavioralError && !profileError && !roadmapError
      
      if (tablesExist) {
        // Process the data from database
        processData(
          activityData || [], 
          practiceData || [], 
          behavioralData || [], 
          userSkills,
          roadmapData || []
        )
      } else {
        // Tables don't exist, use localStorage fallback
        console.log('Tables not found, using localStorage fallback')
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading progress data:', error)
      // Fallback to localStorage
      loadFromLocalStorage()
    }
    setLoading(false)
  }

  const loadFromLocalStorage = () => {
    // Get data from localStorage
    const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
    const completedBehavioral = JSON.parse(localStorage.getItem('completedBehavioral') || '[]')
    const completedRoadmap = JSON.parse(localStorage.getItem('completedRoadmap') || '[]')
    const userSkills = JSON.parse(localStorage.getItem('userSkills') || '["JavaScript", "TypeScript", "React"]') // Default to your 3 skills
    
    // Create mock activity data for today
    const today = new Date().toISOString().split('T')[0]
    const mockActivityData: UserActivity[] = [
      {
        date: today,
        minutes_spent: 10,
        challenges_completed: completedChallenges.length,
        behavioral_completed: completedBehavioral.length
      }
    ]
    
    // Create mock practice data with actual challenge names
    const mockPracticeData = completedChallenges.map((id: string, index: number) => {
      const challengeNames = {
        '1': 'Two Sum',
        '2': 'Valid Parentheses', 
        '3': 'Binary Tree Traversal'
      }
      return {
        id,
        category: challengeNames[id as keyof typeof challengeNames] || `Challenge ${index + 1}`,
        completed: true,
        created_at: new Date().toISOString()
      }
    })
    
    // Create mock behavioral data
    const mockBehavioralData = completedBehavioral.map((id: string, index: number) => ({
      id,
      category: `Behavioral Question ${index + 1}`,
      completed: true,
      created_at: new Date().toISOString()
    }))
    
    // Create mock roadmap data with TypeScript Fundamentals
    const mockRoadmapData = completedRoadmap.length > 0 ? completedRoadmap.map((id: string) => ({
      id: 'TypeScript Fundamentals',
      skills: ['TypeScript', 'JavaScript', 'Types', 'Interfaces'],
      completed: true,
      created_at: new Date().toISOString()
    })) : [{
      id: 'TypeScript Fundamentals',
      skills: ['TypeScript', 'JavaScript', 'Types', 'Interfaces'],
      completed: true,
      created_at: new Date().toISOString()
    }]
    
    // Process the mock data
    processData(
      mockActivityData, 
      mockPracticeData, 
      mockBehavioralData, 
      userSkills,
      mockRoadmapData
    )
  }

  const processData = (
    activityData: UserActivity[],
    practiceData: any[],
    behavioralData: any[],
    userSkills: string[],
    roadmapData: any[]
  ) => {
    // Store data for School Progress section
    setUserSkills(userSkills)
    setPracticeData(practiceData)
    setBehavioralData(behavioralData)
    setRoadmapData(roadmapData)
    
    // Calculate streak
    const streak = calculateStreak(activityData)
    setCurrentStreak(streak)

    // Calculate total minutes
    const totalMins = activityData.reduce((sum, activity) => sum + activity.minutes_spent, 0)
    setTotalMinutes(totalMins)

    // Generate weekly activity (last 7 days)
    const weekly = generateWeeklyActivity(activityData)
    setWeeklyActivity(weekly)

    // Generate skill progress based on completed challenges and user skills
    const skills = generateSkillProgress(practiceData, userSkills, roadmapData)
    setSkillProgress(skills)

    // Generate achievements based on real accomplishments
    const achievementList = generateAchievements(
      practiceData, 
      behavioralData, 
      roadmapData, 
      streak, 
      totalMins
    )
    setAchievements(achievementList)
    
    // Debug logging
    console.log('Processed data:', {
      activityData: activityData.length,
      practiceData: practiceData.length,
      userSkills: userSkills,
      roadmapData: roadmapData.length,
      skills: skills.length,
      streak
    })
  }

  const calculateStreak = (activityData: UserActivity[]): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  // Always return at least 1 if there's any activity data (user is on the site)
  if (activityData.length > 0) {
    // Check if there's activity for today
    const todayActivity = activityData.find(activity => activity.date === todayStr)
    if (todayActivity && todayActivity.minutes_spent > 0) {
      return 1 // Today has activity
    }
    
    // Check if there's any recent activity (within last 2 days)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]
    
    const recentActivity = activityData.find(activity => 
      activity.date >= twoDaysAgoStr && activity.minutes_spent > 0
    )
    
    if (recentActivity) {
      return 1 // Recent activity found
    }
  }
  
  // If no activity at all, return 0
  return 0
}

  const generateWeeklyActivity = (activityData: UserActivity[]): WeeklyActivity[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const weekData: WeeklyActivity[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayActivity = activityData.find(activity => activity.date === dateStr)
      
      weekData.push({
        day: days[date.getDay()],
        hours: dayActivity ? Math.round((dayActivity.minutes_spent / 60) * 10) / 10 : 0
      })
    }
    
    return weekData
  }

  const generateSkillProgress = (practiceData: any[], userSkills: string[], roadmapData: any[]): SkillProgress[] => {
    const skillMap = new Map<string, number>()
    
    // Add user skills from profile with higher weight
    if (userSkills && Array.isArray(userSkills)) {
      userSkills.forEach(skill => {
        skillMap.set(skill, (skillMap.get(skill) || 0) + 5) // Give higher weight for profile skills
      })
    }
    
    // Count challenges by skill category
    practiceData.forEach(session => {
      const category = session.category || 'General'
      skillMap.set(category, (skillMap.get(category) || 0) + 1)
    })
    
    // Add roadmap skills
    roadmapData.forEach(milestone => {
      const skills = milestone.skills || []
      skills.forEach((skill: any) => {
        skillMap.set(skill, (skillMap.get(skill) || 0) + 2) // Medium weight for roadmap skills
      })
    })
    
    // Convert to skill progress
    const skills: SkillProgress[] = []
    skillMap.forEach((count, category) => {
      const maxProgress = 10 // Assume 10 activities per skill for 100%
      const progress = Math.min((count / maxProgress) * 100, 100)
      
      skills.push({
        name: category,
        current: Math.round(progress),
        target: 100,
        category: category
      })
    })
    
    // If no skills found, add a default entry
    if (skills.length === 0 && userSkills && userSkills.length > 0) {
      userSkills.forEach(skill => {
        skills.push({
          name: skill,
          current: 50, // Default progress for profile skills
          target: 100,
          category: skill
        })
      })
    }
    
    return skills.sort((a, b) => b.current - a.current)
  }

  const generateAchievements = (
    practiceData: any[], 
    behavioralData: any[], 
    roadmapData: any[],
    streak: number, 
    totalMins: number
  ): Achievement[] => {
    const achievements: Achievement[] = []
    
    // First Steps - Complete first challenge
    if (practiceData.length > 0) {
      achievements.push({
        id: '1',
        title: 'First Steps',
        description: 'Complete your first coding challenge',
        icon: '🎯',
        earned: true,
        date: practiceData[0].created_at?.split('T')[0]
      })
    } else {
      achievements.push({
        id: '1',
        title: 'First Steps',
        description: 'Complete your first coding challenge',
        icon: '🎯',
        earned: false
      })
    }
    
    // Week Warrior - 7 day streak
    achievements.push({
      id: '2',
      title: 'Week Warrior',
      description: 'Practice for 7 consecutive days',
      icon: '🔥',
      earned: streak >= 7
    })
    
    // Time Master - Spend 10 hours
    achievements.push({
      id: '3',
      title: 'Time Master',
      description: 'Spend 10 hours learning',
      icon: '⏰',
      earned: totalMins >= 600
    })
    
    // Challenge Champion - Complete 10 challenges
    achievements.push({
      id: '4',
      title: 'Challenge Champion',
      description: 'Complete 10 coding challenges',
      icon: '🏆',
      earned: practiceData.length >= 10
    })
    
    // Behavioral Pro - Complete 5 behavioral questions
    achievements.push({
      id: '5',
      title: 'Behavioral Pro',
      description: 'Complete 5 behavioral questions',
      icon: '💬',
      earned: behavioralData.length >= 5
    })
    
    // Roadmap Explorer - Complete 5 roadmap milestones
    achievements.push({
      id: '6',
      title: 'Roadmap Explorer',
      description: 'Complete 5 roadmap milestones',
      icon: '🗺️',
      earned: roadmapData.length >= 5
    })
    
    // Learning Streak - 30 day streak
    achievements.push({
      id: '7',
      title: 'Learning Streak',
      description: 'Maintain a 30-day learning streak',
      icon: '📅',
      earned: streak >= 30
    })
    
    return achievements
  }

  const calculateOverallProgress = () => {
    if (skillProgress.length === 0) return 0
    const totalProgress = skillProgress.reduce((sum, skill) => sum + skill.current, 0)
    return Math.round(totalProgress / skillProgress.length)
  }

  const getEarnedAchievements = () => {
    return achievements.filter(a => a.earned).length
  }

  // Save user skills to localStorage
  const saveUserSkills = (skills: string[]) => {
    localStorage.setItem('userSkills', JSON.stringify(skills))
    setUserSkills(skills)
  }

  // Track user activity when they visit the page
  const trackUserActivity = async () => {
    if (!user) return
    
    const today = new Date().toISOString().split('T')[0]
    
    try {
      // Check if activity already tracked for today
      const { data: existingActivity } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      
      if (existingActivity) {
        // Update existing activity - add more time
        await supabase
          .from('user_activity')
          .update({
            minutes_spent: existingActivity.minutes_spent + 10, // Add 10 minutes for visiting
            updated_at: new Date().toISOString()
          })
          .eq('id', existingActivity.id.id)
      } else {
        // Create new activity record - this is a new day for streak
        await supabase
          .from('user_activity')
          .insert({
            user_id: user.id,
            date: today,
            minutes_spent: 10, // Start with 10 minutes for visiting
            challenges_completed: 0,
            behavioral_completed: 0
          })
      }
      
      // Update streak immediately to 1
      setCurrentStreak(1)
      
      // Don't reload data immediately to prevent race conditions
      // The data will be updated on the next load
    } catch (error) {
      console.error('Error tracking activity:', error)
      // Still set streak to 1 even if tracking fails
      setCurrentStreak(1)
      
      // Fallback to localStorage
      const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]')
      const completedBehavioral = JSON.parse(localStorage.getItem('completedBehavioral') || '[]')
      
      // Update localStorage with today's activity
      const todayActivity = {
        date: today,
        minutes_spent: 10,
        challenges_completed: completedChallenges.length,
        behavioral_completed: completedBehavioral.length
      }
      
      const existingActivities = JSON.parse(localStorage.getItem('userActivities') || '[]')
      const updatedActivities = existingActivities.filter((a: any) => a.date !== today)
      updatedActivities.push(todayActivity)
      localStorage.setItem('userActivities', JSON.stringify(updatedActivities))
    }
  }

  
  const ProgressRing = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
    )
  }

  const SkillProgressCard = ({ skill }: { skill: SkillProgress }) => {
    const progressPercentage = Math.round((skill.current / skill.target) * 100)
    
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-semibold">{skill.name}</h4>
            <Badge variant="outline" className="text-xs border-white/20">
              {skill.category}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current: {skill.current}%</span>
              <span className="text-gray-400">Target: {skill.target}%</span>
            </div>
            
            <div className="relative">
              <ProgressBar value={progressPercentage} className="h-2" />
              
              {/* Target marker */}
              <div 
                className="absolute top-0 w-0.5 h-2 bg-accent"
                style={{ left: `${(skill.target / 100) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card className={`glass border-white/10 interactive transition-all duration-300 ${
      achievement.earned 
        ? 'hover:border-success/50' 
        : 'opacity-50 grayscale hover:opacity-75'
    }`}>
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-4">{achievement.icon}</div>
        
        <h3 className="text-lg font-semibold text-white mb-2">{achievement.title}</h3>
        <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>
        
        <div className="flex justify-center">
          {achievement.earned ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Earned</span>
              {achievement.date && (
                <span className="text-xs text-gray-400">
                  {new Date(achievement.date).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Locked</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading progress tracker...</div>
      </div>
    )
  }

  const overallProgress = calculateOverallProgress()
  const earnedAchievements = getEarnedAchievements()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30 mb-4">
            <Trophy className="h-4 w-4 mr-2" />
            Achievement Hub
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3 font-space-grotesk">
            Your Progress 📈
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Track your learning journey, celebrate achievements, and watch yourself grow
          </p>
        </div>

        {/* Enhanced Stats Row with Gradients */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Overall Progress */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                <Badge className="bg-blue-500/20 text-blue-400">{overallProgress}%</Badge>
              </div>
              <ProgressRing percentage={overallProgress} />
              <p className="text-gray-400 text-sm mt-3 text-center">Overall Progress</p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <Badge className="bg-orange-500/20 text-orange-400">Active</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-white">{currentStreak}</p>
              <p className="text-xs text-gray-500 mt-2">consecutive days</p>
            </CardContent>
          </Card>

          {/* Total Achievements */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="h-6 w-6 text-purple-500" />
                <Badge className="bg-purple-500/20 text-purple-400">Earned</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Achievements</p>
              <p className="text-3xl font-bold text-white">{earnedAchievements}</p>
              <p className="text-xs text-gray-500 mt-2">out of {achievements.length}</p>
            </CardContent>
          </Card>

          {/* Total Hours */}
          <Card className="glass hover-lift border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Clock className="h-6 w-6 text-emerald-500" />
                <Badge className="bg-emerald-500/20 text-emerald-400">Total</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-1">Learning Hours</p>
              <p className="text-3xl font-bold text-white">{Math.round(totalMinutes / 60)}</p>
              <p className="text-xs text-gray-500 mt-2">keep it up</p>
            </CardContent>
          </Card>
        </div>

        {/* Horizontal Sections */}
        <div className="space-y-8 mb-8">
          {/* Skills Progress - Horizontal Box */}
          <Card className="glass border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-500" />
                Skills Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Profile Skills Section */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Profile Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userSkills && userSkills.length > 0 ? (
                      userSkills.map((skill: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                          <span className="text-sm text-gray-300">{skill}</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                              style={{ width: `${Math.min((userSkills.length / userSkills.length) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No skills added yet</div>
                    )}
                  </div>
                </div>

                {/* Completed Roadmaps */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Completed Roadmaps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmapData && roadmapData.length > 0 ? (
                      roadmapData.map((roadmap: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                          <span className="text-sm text-gray-300">{roadmap.id || `Milestone ${index + 1}`}</span>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            {roadmap.skills && roadmap.skills.length > 0 && (
                              <div className="flex gap-1">
                                {roadmap.skills.slice(0, 2).map((skill: string, skillIndex: number) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs border-white/20">
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No roadmaps completed yet</div>
                    )}
                  </div>
                </div>

                {/* Practice Challenges */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Practice Challenges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {practiceData && practiceData.length > 0 ? (
                      practiceData.map((challenge: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                          <span className="text-sm text-gray-300">{challenge.category || `Challenge ${index + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <Badge variant="outline" className="text-xs border-white/20">
                              {challenge.difficulty || 'General'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No challenges completed yet</div>
                    )}
                  </div>
                </div>

                {/* Behavioral Questions */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Behavioral Questions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {behavioralData && behavioralData.length > 0 ? (
                      behavioralData.map((question: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                          <span className="text-sm text-gray-300">{question.category || `Question ${index + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <Badge variant="outline" className="text-xs border-white/20">
                              {question.difficulty || 'General'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No behavioral questions completed yet</div>
                    )}
                  </div>
                </div>

                {/* Overall Skill Progress Bars */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Overall Progress
                  </h4>
                  <div className="space-y-3">
                    {skillProgress.map((skill, index) => (
                      <SkillProgressCard key={index} skill={skill} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity - Horizontal Box */}
          <Card className="glass border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Hours practiced this week</span>
                  <span className="text-white font-semibold">
                    {weeklyActivity.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>Total time spent</span>
                  <span className="text-white font-semibold">
                    {Math.round(totalMinutes / 60 * 10) / 10}h total
                  </span>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex-shrink-0 text-center">
                      <div className="text-xs text-gray-400 mb-1">{day.day}</div>
                      <div className="w-12 bg-muted rounded-full h-16 overflow-hidden relative">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-accent transition-all duration-300"
                          style={{ height: `${(day.hours / 6) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-300 mt-1">{day.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements - Horizontal Box */}
          <Card className="glass border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-600" />
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => {
                  const achievementGradients: Record<string, string> = {
                    'Beginner': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
                    'Week Warrior': 'from-red-500/20 to-orange-500/20 border-red-500/30',
                    'Time Master': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
                    'Challenge Champion': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
                    'Behavioral Pro': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
                    'Roadmap Explorer': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
                    'Learning Streak': 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
                  };

                  const achievementBorder: Record<string, string> = {
                    'Beginner': 'from-emerald-500 to-teal-600',
                    'Week Warrior': 'from-red-500 to-orange-600',
                    'Time Master': 'from-purple-500 to-pink-600',
                    'Challenge Champion': 'from-blue-500 to-cyan-600',
                    'Behavioral Pro': 'from-indigo-500 to-blue-600',
                    'Roadmap Explorer': 'from-green-500 to-emerald-600',
                    'Learning Streak': 'from-yellow-500 to-amber-600'
                  };

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all duration-300 overflow-hidden relative group ${
                        achievement.earned 
                          ? `bg-gradient-to-br ${achievementGradients[achievement.title] || 'from-primary/20 to-accent/20'} border-white/20 hover:border-white/40 hover-lift`
                          : 'border-white/10 bg-background/50 hover:border-white/20 opacity-60'
                      }`}
                    >
                      {achievement.earned && (
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${achievementBorder[achievement.title] || 'from-primary to-accent'}`} />
                      )}
                      <div className="text-3xl mb-2 text-center">{achievement.icon}</div>
                      <h4 className="text-white font-semibold text-sm mb-1 text-center">{achievement.title}</h4>
                      <p className="text-gray-400 text-xs mb-3 text-center line-clamp-2">{achievement.description}</p>
                      {achievement.earned && (
                        <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Unlocked</span>
                        </div>
                      )}
                      {!achievement.earned && (
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
