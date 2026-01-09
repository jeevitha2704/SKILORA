-- Insert default achievements
INSERT INTO achievements (title, description, icon, condition_type, condition_value) VALUES
('First Steps', 'Complete your first skill analysis', 'Trophy', 'skills_analyzed', 1),
('Skill Collector', 'Add 10 skills to your profile', 'Award', 'skills_added', 10),
('Learning Journey', 'Complete your first learning milestone', 'Target', 'milestones_completed', 1),
('Practice Makes Perfect', 'Complete 5 practice challenges', 'CheckCircle', 'challenges_completed', 5),
('Consistency King', 'Maintain a 7-day learning streak', 'Flame', 'streak_days', 7),
('Knowledge Master', 'Reach 90% skill match in any analysis', 'Brain', 'skill_match_90', 1),
('Roadmap Explorer', 'Complete an entire learning roadmap', 'Map', 'roadmap_completed', 1),
('Quick Learner', 'Complete a milestone in under 3 days', 'Zap', 'fast_milestone', 1),
('Dedicated Student', 'Spend 50 hours total learning', 'Clock', 'hours_learned', 50),
('Skill Expert', 'Master 5 skills at level 4', 'Star', 'skills_mastered', 5);
