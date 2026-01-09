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
  CheckCircle2
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

const sampleSkillProgress: SkillProgress[] = [
  { name: 'React', current: 75, target: 100, category: 'Frontend' },
  { name: 'TypeScript', current: 60, target: 80, category: 'Languages' },
  { name: 'Node.js', current: 45, target: 70, category: 'Backend' },
  { name: 'Python', current: 80, target: 90, category: 'Languages' },
  { name: 'Docker', current: 30, target: 60, category: 'DevOps' },
  { name: 'AWS', current: 25, target: 50, category: 'Cloud' }
]

const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first coding challenge',
    icon: '🎯',
    earned: true,
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    earned: true,
    date: '2024-01-22'
  },
  {
    id: '3',
    title: 'Skill Master',
    description: 'Reach 100% proficiency in any skill',
    icon: '⭐',
    earned: false
  },
  {
    id: '4',
    title: 'Challenge Champion',
    description: 'Complete 50 coding challenges',
    icon: '🏆',
    earned: false
  },
  {
    id: '5',
    title: 'Learning Streak',
    description: 'Maintain a 30-day learning streak',
    icon: '📅',
    earned: false
  },
  {
    id: '6',
    title: 'Full Stack Hero',
    description: 'Master both frontend and backend skills',
    icon: '🚀',
    earned: false
  }
]

const sampleWeeklyActivity: WeeklyActivity[] = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 2.9 },
  { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 3.7 }
]

export default function Progress() {
  const { user } = useAuth()
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgressData()
    } else {
      setLoading(false)
      // Load sample data for demo
      setSkillProgress(sampleSkillProgress)
      setAchievements(sampleAchievements)
      setWeeklyActivity(sampleWeeklyActivity)
    }
  }, [user])

  const loadProgressData = async () => {
    // Load skill progress
    const { data: skillData } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user?.id)
    
    if (skillData && skillData.length > 0) {
      const progress = skillData.map(skill => ({
        name: skill.skill_name,
        current: skill.years_experience * 20, // Mock calculation
        target: 100,
        category: 'General'
      }))
      setSkillProgress(progress)
    } else {
      setSkillProgress(sampleSkillProgress)
    }

    // Load achievements
    const { data: achievementData } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user?.id)
    
    if (achievementData && achievementData.length > 0) {
      setAchievements(achievementData)
    } else {
      setAchievements(sampleAchievements)
    }

    // Load weekly activity (mock data for now)
    setWeeklyActivity(sampleWeeklyActivity)
    setLoading(false)
  }

  const calculateOverallProgress = () => {
    if (skillProgress.length === 0) return 0
    const totalProgress = skillProgress.reduce((sum, skill) => sum + (skill.current / skill.target) * 100, 0)
    return Math.round(totalProgress / skillProgress.length)
  }

  const getCurrentStreak = () => {
    return 12 // Mock streak data
  }

  const getEarnedAchievements = () => {
    return achievements.filter(a => a.earned).length
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
  const currentStreak = getCurrentStreak()
  const earnedAchievements = getEarnedAchievements()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 font-space-grotesk">
            Your Progress
          </h1>
          <p className="text-xl text-gray-300">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-white/10">
            <CardContent className="p-6 text-center">
              <ProgressRing percentage={overallProgress} />
              <p className="text-gray-400 mt-4">Overall Progress</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6 text-center">
              <Flame className="h-12 w-12 text-warning mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{currentStreak}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{earnedAchievements}</div>
              <div className="text-sm text-gray-400">Total Achievements</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Progress */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillProgress.map((skill, index) => (
                  <SkillProgressCard key={index} skill={skill} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
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
                
                <div className="space-y-3">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-12">{day.day}</span>
                      <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${(day.hours / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-12 text-right">{day.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
