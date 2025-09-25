-- Gamified Todo System Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE item_type AS ENUM ('task', 'habit', 'quest');
CREATE TYPE item_status AS ENUM ('created', 'scheduled', 'in_progress', 'completed', 'abandoned');
CREATE TYPE domain AS ENUM ('task', 'habit', 'quest', 'game');

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  locale text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Projects (optional grouping for tasks)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  archived boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Items (tasks, habits, quests)
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  type item_type NOT NULL DEFAULT 'task',
  title text NOT NULL,
  description text,
  status item_status NOT NULL DEFAULT 'created',
  priority smallint DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1=highest, 5=lowest
  due_at timestamptz,
  completed_at timestamptz,
  estimated_minutes integer,
  actual_minutes integer,
  xp_reward integer DEFAULT 10,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Recurrence patterns for habits
CREATE TABLE public.item_recurrence (
  item_id uuid PRIMARY KEY REFERENCES public.items(id) ON DELETE CASCADE,
  rrule text NOT NULL, -- RFC5545 RRULE string
  timezone text NOT NULL DEFAULT 'UTC',
  next_occurrence timestamptz,
  last_occurrence timestamptz
);

-- Sub-tasks/steps
CREATE TABLE public.item_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_completed boolean DEFAULT FALSE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

-- Item-Tag relationships
CREATE TABLE public.item_tags (
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Event log (append-only for audit trail and analytics)
CREATE TABLE public.events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain domain NOT NULL,
  kind text NOT NULL, -- created, updated, completed, started, etc.
  entity_id uuid, -- item_id, quiz_session_id, etc.
  entity_type text, -- item, quiz_session, etc.
  occurred_at timestamptz DEFAULT NOW(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text
);

-- Game-specific tables
CREATE TABLE public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT NOW(),
  finished_at timestamptz,
  score integer DEFAULT 0,
  total_questions smallint DEFAULT 10,
  correct_answers smallint DEFAULT 0,
  perfect_bonus boolean DEFAULT FALSE
);

CREATE TABLE public.quiz_answers (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_number smallint NOT NULL,
  question_cyrillic text NOT NULL,
  correct_latin text NOT NULL,
  chosen_latin text,
  is_correct boolean NOT NULL,
  time_taken_ms integer,
  answered_at timestamptz DEFAULT NOW()
);

CREATE TABLE public.letter_attempts (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cyrillic text NOT NULL,
  latin text NOT NULL,
  action text NOT NULL, -- 'viewed', 'audio_played', 'quiz_attempt'
  result text, -- 'correct', 'incorrect', null for non-quiz actions
  session_id uuid REFERENCES public.quiz_sessions(id),
  occurred_at timestamptz DEFAULT NOW()
);

-- XP Ledger (all XP transactions)
CREATE TABLE public.xp_ledger (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL, -- 'task_completed', 'quiz_perfect', 'streak_bonus', etc.
  amount integer NOT NULL CHECK (amount != 0),
  description text,
  ref_event_id bigint REFERENCES public.events(id),
  ref_entity_id uuid, -- item_id, quiz_session_id, etc.
  ref_entity_type text,
  occurred_at timestamptz DEFAULT NOW()
);

-- Badges/Achievements
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL, -- 'first_task', 'quiz_master', 'streak_7', etc.
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  category text DEFAULT 'general', -- 'learning', 'productivity', 'streak', etc.
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb, -- conditions for earning
  xp_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT NOW(),
  progress jsonb DEFAULT '{}'::jsonb, -- for progress tracking
  UNIQUE(user_id, badge_id)
);

-- Daily summaries (for streak tracking and analytics)
CREATE TABLE public.daily_summaries (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  tasks_completed integer DEFAULT 0,
  habits_completed integer DEFAULT 0,
  quiz_sessions integer DEFAULT 0,
  quiz_perfect_sessions integer DEFAULT 0,
  total_xp_earned integer DEFAULT 0,
  streak_day boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_items_user_status ON public.items (user_id, status);
CREATE INDEX idx_items_user_due ON public.items (user_id, due_at);
CREATE INDEX idx_items_user_type ON public.items (user_id, type);
CREATE INDEX idx_events_user_domain_time ON public.events (user_id, domain, occurred_at DESC);
CREATE INDEX idx_events_entity ON public.events (entity_id, entity_type);
CREATE INDEX idx_xp_ledger_user_time ON public.xp_ledger (user_id, occurred_at DESC);
CREATE INDEX idx_quiz_sessions_user_time ON public.quiz_sessions (user_id, started_at DESC);
CREATE INDEX idx_letter_attempts_user_time ON public.letter_attempts (user_id, occurred_at DESC);
CREATE INDEX idx_daily_summaries_user_date ON public.daily_summaries (user_id, date DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own items" ON public.items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own item_recurrence" ON public.item_recurrence FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_recurrence.item_id AND items.user_id = auth.uid()));

CREATE POLICY "Users can manage own item_steps" ON public.item_steps FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_steps.item_id AND items.user_id = auth.uid()));

CREATE POLICY "Users can manage own item_tags" ON public.item_tags FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid()));

CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz_sessions" ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz_answers" ON public.quiz_answers FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.quiz_sessions WHERE quiz_sessions.id = quiz_answers.session_id AND quiz_sessions.user_id = auth.uid()));

CREATE POLICY "Users can manage own letter_attempts" ON public.letter_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own xp_ledger" ON public.xp_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own user_badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own daily_summaries" ON public.daily_summaries FOR SELECT USING (auth.uid() = user_id);

-- Public read for badges (everyone can see badge definitions)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- Functions and triggers for automatic updates

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level(total_xp integer)
RETURNS integer AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- Requires: Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  RETURN GREATEST(1, FLOOR(SQRT(total_xp::float / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP and update profile
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_source text,
  p_amount integer,
  p_description text DEFAULT NULL,
  p_ref_entity_id uuid DEFAULT NULL,
  p_ref_entity_type text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert XP transaction
  INSERT INTO public.xp_ledger (user_id, source, amount, description, ref_entity_id, ref_entity_type)
  VALUES (p_user_id, p_source, p_amount, p_description, p_ref_entity_id, p_ref_entity_type);
  
  -- Update user profile totals
  UPDATE public.profiles 
  SET 
    total_xp = total_xp + p_amount,
    level = calculate_level(total_xp + p_amount),
    last_active_date = CURRENT_DATE
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed data: Insert basic badges
INSERT INTO public.badges (key, name, description, icon, category, xp_reward) VALUES
('first_task', 'Getting Started', 'Complete your first task', '🎯', 'productivity', 50),
('task_streak_3', '3-Day Streak', 'Complete tasks for 3 days in a row', '🔥', 'streak', 100),
('task_streak_7', 'Week Warrior', 'Complete tasks for 7 days in a row', '⚡', 'streak', 200),
('quiz_first', 'First Quiz', 'Take your first Cyrillic quiz', '📚', 'learning', 25),
('quiz_perfect', 'Perfect Score', 'Get 100% on a Cyrillic quiz', '🎯', 'learning', 100),
('quiz_master', 'Quiz Master', 'Get perfect scores on 5 quizzes', '🏆', 'learning', 300),
('letter_explorer', 'Letter Explorer', 'Play audio for 10 different letters', '🔊', 'learning', 50),
('cyrillic_novice', 'Cyrillic Novice', 'Attempt 50 letters in quiz mode', '📖', 'learning', 150),
('task_completionist', 'Task Completionist', 'Complete 25 tasks', '✅', 'productivity', 250),
('habit_builder', 'Habit Builder', 'Complete a habit 7 times', '🏗️', 'productivity', 200)
ON CONFLICT (key) DO NOTHING;

-- Create a view for user stats (optional, for easier querying)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.*,
  COALESCE(recent_xp.daily_xp, 0) as xp_today,
  COALESCE(badge_count.total_badges, 0) as total_badges,
  COALESCE(task_stats.total_tasks, 0) as total_tasks_completed,
  COALESCE(quiz_stats.total_quizzes, 0) as total_quizzes_taken,
  COALESCE(quiz_stats.perfect_quizzes, 0) as perfect_quizzes
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, SUM(amount) as daily_xp
  FROM public.xp_ledger 
  WHERE occurred_at::date = CURRENT_DATE
  GROUP BY user_id
) recent_xp ON p.user_id = recent_xp.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_badges
  FROM public.user_badges
  GROUP BY user_id
) badge_count ON p.user_id = badge_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_tasks
  FROM public.items 
  WHERE type = 'task' AND status = 'completed'
  GROUP BY user_id
) task_stats ON p.user_id = task_stats.user_id
LEFT JOIN (
  SELECT 
    user_id, 
    COUNT(*) as total_quizzes,
    SUM(CASE WHEN perfect_bonus THEN 1 ELSE 0 END) as perfect_quizzes
  FROM public.quiz_sessions 
  WHERE finished_at IS NOT NULL
  GROUP BY user_id
) quiz_stats ON p.user_id = quiz_stats.user_id;
