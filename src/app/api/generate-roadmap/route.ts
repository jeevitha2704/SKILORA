import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RoadmapMilestone {
  title: string
  description: string
  targetSkills: string[]
  estimatedWeeks: number
  resources: Array<{
    type: 'course' | 'project' | 'certification' | 'article'
    title: string
    url?: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
}

async function generateRoadmap(
  userSkills: string[],
  requiredSkills: string[]
): Promise<RoadmapMilestone[]> {
  // This is a mock implementation. In a real app, you'd use AI to generate personalized roadmaps
  const missingSkills = requiredSkills.filter(skill => !userSkills.includes(skill))
  
  const milestones: RoadmapMilestone[] = [
    {
      title: 'Foundation Building',
      description: 'Master the fundamental concepts and tools',
      targetSkills: ['JavaScript', 'HTML', 'CSS'],
      estimatedWeeks: 4,
      resources: [
        {
          type: 'course',
          title: 'JavaScript: The Complete Guide',
          difficulty: 'beginner'
        },
        {
          type: 'project',
          title: 'Build a Personal Portfolio Website',
          difficulty: 'beginner'
        }
      ]
    },
    {
      title: 'React Fundamentals',
      description: 'Learn React from basics to advanced patterns',
      targetSkills: ['React', 'JSX', 'Components', 'State Management'],
      estimatedWeeks: 6,
      resources: [
        {
          type: 'course',
          title: 'React - The Complete Guide',
          difficulty: 'intermediate'
        },
        {
          type: 'project',
          title: 'Build a Todo App with React',
          difficulty: 'intermediate'
        }
      ]
    },
    {
      title: 'Advanced React & TypeScript',
      description: 'Master advanced React patterns and TypeScript integration',
      targetSkills: ['TypeScript', 'Advanced React', 'Performance Optimization'],
      estimatedWeeks: 8,
      resources: [
        {
          type: 'course',
          title: 'Advanced React Patterns',
          difficulty: 'advanced'
        },
        {
          type: 'certification',
          title: 'React Developer Certification',
          difficulty: 'advanced'
        }
      ]
    }
  ]

  return milestones
}

export async function POST(request: NextRequest) {
  try {
    const { userSkills, requiredSkills, userId } = await request.json()

    if (!userSkills || !requiredSkills) {
      return NextResponse.json(
        { error: 'User skills and required skills are required' },
        { status: 400 }
      )
    }

    // Generate roadmap
    const milestones = await generateRoadmap(userSkills, requiredSkills)

    // Save roadmap to database if userId is provided
    if (userId) {
      // Clear existing roadmap for this user
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', userId)

      // Insert new milestones
      for (const milestone of milestones) {
        const { error } = await supabase
          .from('learning_progress')
          .insert({
            user_id: userId,
            milestone_title: milestone.title,
            milestone_description: milestone.description,
            target_skills: milestone.targetSkills,
            estimated_weeks: milestone.estimatedWeeks,
            resources: milestone.resources,
            status: 'not_started'
          })

        if (error) {
          console.error('Error saving roadmap milestone:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      roadmap: milestones
    })

  } catch (error) {
    console.error('Error generating roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
