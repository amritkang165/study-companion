-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- Drops old incompatible tables and creates the correct ones.

DROP TABLE IF EXISTS public.achievements;
DROP TABLE IF EXISTS public.pomodoro_sessions;
DROP TABLE IF EXISTS public.revisions;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.schedules;

CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#e8505b',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.topics (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "subjectId" TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Not Started',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  deadline TIMESTAMPTZ,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  "completedAt" TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.revisions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "topicId" TEXT,
  "subjectId" TEXT,
  "topicName" TEXT DEFAULT '',
  "subjectName" TEXT DEFAULT '',
  "revisionDate" DATE,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own subjects" ON subjects
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can CRUD own topics" ON topics
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can CRUD own tasks" ON tasks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can CRUD own revisions" ON revisions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
