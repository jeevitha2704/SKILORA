import { supabase } from './supabase'

// Types
export interface Profile {
  id: string
  full_name?: string
  avatar_url?: string
  bio?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  technologies: string[]
  project_url?: string
  github_url?: string
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_name: string
  level: number
  category: string
  created_at?: string
  updated_at?: string
}

export interface JobAnalysis {
  id: string
  user_id: string
  title: string
  company?: string
  experience?: string
  education?: string
  raw_text: string
  parsed_skills: ParsedSkill[]
  created_at?: string
}

export interface ParsedSkill {
  name: string
  category: 'technical' | 'tool' | 'soft' | 'domain'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  required: boolean
}

export interface SkillComparison {
  id: string
  user_id: string
  job_analysis_id: string
  skill_name: string
  required_level: number
  current_level: number
  status: 'match' | 'partial' | 'missing'
  category: string
  created_at?: string
}

export interface RoadmapMilestone {
  id: string
  user_id: string
  title: string
  description: string
  duration: string
  status: 'completed' | 'current' | 'locked'
  type: 'course' | 'project' | 'practice'
  resources: Resource[]
  skills: string[]
  order_index: number
  created_at?: string
  updated_at?: string
}

export interface Resource {
  name: string
  url: string
  type: 'article' | 'video' | 'course' | 'documentation'
}

export interface PracticeChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  skills: string[]
  category: string
  instructions: string
  solution_hint?: string
  created_at?: string
}

export interface PracticeSession {
  id: string
  user_id: string
  challenge_id: string
  completed: boolean
  time_spent: number
  started_at: string
  completed_at?: string
  notes?: string
}

export interface LearningProgress {
  id: string
  user_id: string
  date: string
  hours_spent: number
  skills_practiced: string[]
  milestones_completed: number
  challenges_completed: number
  created_at?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  created_at?: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

// Profile operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  // First try to update existing profile
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (updateError) {
    // If update fails, try to insert (profile doesn't exist)
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, ...updates })
      .select()
      .single()
    
    if (insertError) throw insertError
    return insertData
  }
  
  if (!updateData) {
    throw new Error('Profile not found and could not be updated')
  }
  
  return updateData
}

// User Skills operations
export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addUserSkill(userId: string, skillName: string, level: number, category: string): Promise<UserSkill> {
  const { data, error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_name: skillName,
      level,
      category
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserSkill(skillId: string, updates: Partial<UserSkill>): Promise<UserSkill> {
  const { data, error } = await supabase
    .from('user_skills')
    .update(updates)
    .eq('id', skillId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteUserSkill(skillId: string): Promise<void> {
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', skillId)
  
  if (error) throw error
}

// Job Analysis operations
export async function createJobAnalysis(userId: string, analysis: Omit<JobAnalysis, 'id' | 'user_id' | 'created_at'>): Promise<JobAnalysis> {
  const { data, error } = await supabase
    .from('job_analyses')
    .insert({
      user_id: userId,
      ...analysis
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getJobAnalyses(userId: string): Promise<JobAnalysis[]> {
  const { data, error } = await supabase
    .from('job_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getJobAnalysis(analysisId: string): Promise<JobAnalysis | null> {
  const { data, error } = await supabase
    .from('job_analyses')
    .select('*')
    .eq('id', analysisId)
    .single()
  
  if (error) throw error
  return data
}

// Project operations
export async function addProject(userId: string, project: Omit<Project, 'id' | 'user_id' | 'created_at'>): Promise<Project> {
  const { data, error } = await supabase
    .from('user_projects')
    .insert({
      user_id: userId,
      ...project
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('user_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('user_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('user_projects')
    .delete()
    .eq('id', projectId)
  
  if (error) throw error
}

// Skill Comparison operations
export async function createSkillComparison(userId: string, jobAnalysisId: string, comparisons: Omit<SkillComparison, 'id' | 'user_id' | 'job_analysis_id' | 'created_at'>[]): Promise<SkillComparison[]> {
  const { data, error } = await supabase
    .from('skill_comparisons')
    .insert(
      comparisons.map(comp => ({
        user_id: userId,
        job_analysis_id: jobAnalysisId,
        ...comp
      }))
    )
    .select()
  
  if (error) throw error
  return data || []
}

export async function getSkillComparisons(userId: string, jobAnalysisId?: string): Promise<SkillComparison[]> {
  let query = supabase
    .from('skill_comparisons')
    .select('*')
    .eq('user_id', userId)
  
  if (jobAnalysisId) {
    query = query.eq('job_analysis_id', jobAnalysisId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Roadmap operations
export async function getRoadmapMilestones(userId: string): Promise<RoadmapMilestone[]> {
  const { data, error } = await supabase
    .from('roadmap_milestones')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createRoadmapMilestones(userId: string, milestones: Omit<RoadmapMilestone, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<RoadmapMilestone[]> {
  const { data, error } = await supabase
    .from('roadmap_milestones')
    .insert(
      milestones.map(milestone => ({
        user_id: userId,
        ...milestone
      }))
    )
    .select()
  
  if (error) throw error
  return data || []
}

export async function updateRoadmapMilestone(milestoneId: string, updates: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
  const { data, error } = await supabase
    .from('roadmap_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Practice operations
export async function getPracticeChallenges(category?: string): Promise<PracticeChallenge[]> {
  let query = supabase
    .from('practice_challenges')
    .select('*')
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createPracticeSession(userId: string, sessionId: Omit<PracticeSession, 'id' | 'user_id' | 'started_at'>): Promise<PracticeSession> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: userId,
      ...sessionId
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePracticeSession(sessionId: string, updates: Partial<PracticeSession>): Promise<PracticeSession> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getPracticeSessions(userId: string): Promise<PracticeSession[]> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Progress operations
export async function getLearningProgress(userId: string, startDate?: string, endDate?: string): Promise<LearningProgress[]> {
  let query = supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
  
  if (startDate) {
    query = query.gte('date', startDate)
  }
  
  if (endDate) {
    query = query.lte('date', endDate)
  }
  
  const { data, error } = await query.order('date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function updateLearningProgress(userId: string, date: string, updates: Partial<LearningProgress>): Promise<LearningProgress> {
  const { data, error } = await supabase
    .from('learning_progress')
    .upsert({
      user_id: userId,
      date,
      ...updates
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Achievement operations
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getUserAchievements(userId: string): Promise<(UserAchievement & Achievement)[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  if (error) throw error
  return data?.map(item => ({
    ...item,
    ...item.achievement
  })) || []
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
