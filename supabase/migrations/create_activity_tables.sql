-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  minutes_spent INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  behavioral_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  category TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create behavioral_sessions table
CREATE TABLE IF NOT EXISTS behavioral_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roadmap_progress table
CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  skills TEXT[],
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(date);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed ON practice_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_behavioral_sessions_user_id ON behavioral_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_sessions_completed ON behavioral_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_user_roadmap_progress_user_id ON user_roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roadmap_progress_completed ON user_roadmap_progress(completed);

-- Add RLS policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity" ON user_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for practice_sessions
CREATE POLICY "Users can view own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for behavioral_sessions
CREATE POLICY "Users can view own behavioral sessions" ON behavioral_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own behavioral sessions" ON behavioral_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own behavioral sessions" ON behavioral_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_roadmap_progress
CREATE POLICY "Users can view own roadmap progress" ON user_roadmap_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap progress" ON user_roadmap_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap progress" ON user_roadmap_progress
  FOR UPDATE USING (auth.uid() = user_id);
