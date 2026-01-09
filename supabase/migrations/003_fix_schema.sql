-- Drop existing tables and recreate with correct schema
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS job_analyses CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User projects table
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[],
  project_url TEXT,
  github_url TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job analyses table
CREATE TABLE job_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  company TEXT,
  experience TEXT,
  education TEXT,
  raw_text TEXT NOT NULL,
  parsed_skills JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill comparisons table
CREATE TABLE skill_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_analysis_id UUID REFERENCES job_analyses(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  current_level INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('match', 'partial', 'missing')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmap milestones table
CREATE TABLE roadmap_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'current', 'locked')),
  type TEXT NOT NULL CHECK (type IN ('course', 'project', 'practice')),
  resources JSONB,
  skills TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice challenges table
CREATE TABLE practice_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration TEXT,
  skills TEXT[],
  category TEXT,
  instructions TEXT,
  solution_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice sessions table
CREATE TABLE practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES practice_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Learning progress table
CREATE TABLE learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours_spent INTEGER,
  skills_practiced TEXT[],
  milestones_completed INTEGER,
  challenges_completed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  condition_type TEXT,
  condition_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_job_analyses_user_id ON job_analyses(user_id);
CREATE INDEX idx_skill_comparisons_user_id ON skill_comparisons(user_id);
CREATE INDEX idx_roadmap_milestones_user_id ON roadmap_milestones(user_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);

CREATE POLICY "Users can view own projects" ON user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON user_projects FOR ALL USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own job analyses" ON job_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own job analyses" ON job_analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skill comparisons" ON skill_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skill comparisons" ON skill_comparisons FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmap milestones" ON roadmap_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own roadmap milestones" ON roadmap_milestones FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own practice sessions" ON practice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own practice sessions" ON practice_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own projects" ON user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON user_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default achievements
INSERT INTO achievements (title, description, icon, condition_type, condition_value) VALUES
('First Steps', 'Complete your profile setup', '🎯', 'profile_complete', 1),
('Skill Explorer', 'Add 5 skills to your profile', '🔍', 'skills_added', 5),
('Project Builder', 'Complete your first project', '🚀', 'projects_completed', 1),
('Job Analyzer', 'Analyze your first job description', '📊', 'jobs_analyzed', 1),
('Learning Journey', 'Start your first learning milestone', '📚', 'milestones_started', 1),
('Practice Makes Perfect', 'Complete 10 practice sessions', '💪', 'sessions_completed', 10),
('Goal Getter', 'Complete your first goal', '⭐', 'goals_completed', 1),
('Achievement Hunter', 'Unlock 5 achievements', '🏆', 'achievements_unlocked', 5);
