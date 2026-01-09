import { supabase } from './supabase'

export const trackChallengeCompletion = async (userId: string, challengeId: string, category: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Record practice session
    await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        category: category,
        completed: true,
        created_at: new Date().toISOString()
      })
    
    // Update daily activity
    const { data: existingActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existingActivity) {
      await supabase
        .from('user_activity')
        .update({
          challenges_completed: existingActivity.challenges_completed + 1,
          minutes_spent: existingActivity.minutes_spent + 15, // Add 15 minutes for completing challenge
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActivity.id)
    } else {
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          date: today,
          minutes_spent: 15,
          challenges_completed: 1,
          behavioral_completed: 0
        })
    }
  } catch (error) {
    console.error('Error tracking challenge completion:', error)
  }
}

export const trackBehavioralCompletion = async (userId: string, questionId: string, category: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Record behavioral session
    await supabase
      .from('behavioral_sessions')
      .insert({
        user_id: userId,
        question_id: questionId,
        category: category,
        completed: true,
        created_at: new Date().toISOString()
      })
    
    // Update daily activity
    const { data: existingActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existingActivity) {
      await supabase
        .from('user_activity')
        .update({
          behavioral_completed: existingActivity.behavioral_completed + 1,
          minutes_spent: existingActivity.minutes_spent + 10, // Add 10 minutes for behavioral question
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActivity.id)
    } else {
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          date: today,
          minutes_spent: 10,
          challenges_completed: 0,
          behavioral_completed: 1
        })
    }
  } catch (error) {
    console.error('Error tracking behavioral completion:', error)
  }
}

export const trackRoadmapCompletion = async (userId: string, milestoneId: string, skills: string[]) => {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Record roadmap progress
    await supabase
      .from('user_roadmap_progress')
      .insert({
        user_id: userId,
        milestone_id: milestoneId,
        skills: skills,
        completed: true,
        created_at: new Date().toISOString()
      })
    
    // Update daily activity
    const { data: existingActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existingActivity) {
      await supabase
        .from('user_activity')
        .update({
          minutes_spent: existingActivity.minutes_spent + 20, // Add 20 minutes for roadmap milestone
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActivity.id)
    } else {
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          date: today,
          minutes_spent: 20,
          challenges_completed: 0,
          behavioral_completed: 0
        })
    }
  } catch (error) {
    console.error('Error tracking roadmap completion:', error)
  }
}

export const trackPageVisit = async (userId: string, page: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Update daily activity for page visit
    const { data: existingActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existingActivity) {
      await supabase
        .from('user_activity')
        .update({
          minutes_spent: existingActivity.minutes_spent + 5, // Add 5 minutes for page visit
          updated_at: new Date().toISOString()
        })
        .eq('id', existingActivity.id)
    } else {
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          date: today,
          minutes_spent: 5,
          challenges_completed: 0,
          behavioral_completed: 0
        })
    }
  } catch (error) {
    console.error('Error tracking page visit:', error)
  }
}
