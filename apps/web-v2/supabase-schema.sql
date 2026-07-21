-- William — Supabase Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/imguadokkmkckvukkmjg/sql

-- Portrait (single row — your cognitive profile)
CREATE TABLE IF NOT EXISTS portrait (
  id TEXT PRIMARY KEY DEFAULT 'user_1',
  name TEXT,
  identity TEXT,
  "values" TEXT,
  principles TEXT,
  strengths TEXT,
  blind_spots TEXT,
  dreams TEXT,
  relationships TEXT,
  decision_patterns JSONB DEFAULT '[]',
  growth JSONB DEFAULT '[]',
  cognitive_profile JSONB DEFAULT '{}',
  active_beliefs JSONB DEFAULT '[]',
  emotional_trends JSONB DEFAULT '[]',
  behavioral_patterns JSONB DEFAULT '[]',
  identity_evolution JSONB DEFAULT '[]'
);

-- Journeys
CREATE TABLE IF NOT EXISTS journeys (
  id TEXT PRIMARY KEY,
  category TEXT,
  icon TEXT,
  title TEXT,
  current_state TEXT,
  vision TEXT,
  milestones JSONB DEFAULT '[]',
  memories JSONB DEFAULT '[]',
  lessons JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library
CREATE TABLE IF NOT EXISTS library (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  author TEXT,
  content TEXT,
  date_added TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat history
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'william')),
  text TEXT,
  time TEXT,
  session TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chronicle / timeline entries
CREATE TABLE IF NOT EXISTS chronicle (
  id TEXT PRIMARY KEY,
  time TEXT,
  category TEXT,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory knowledge graph — nodes
CREATE TABLE IF NOT EXISTS memory_nodes (
  id TEXT PRIMARY KEY,
  type TEXT,
  label TEXT,
  description TEXT,
  confidence REAL DEFAULT 1.0,
  last_updated TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Memory knowledge graph — edges
CREATE TABLE IF NOT EXISTS memory_edges (
  id TEXT PRIMARY KEY,
  from_id TEXT REFERENCES memory_nodes(id) ON DELETE CASCADE,
  to_id TEXT REFERENCES memory_nodes(id) ON DELETE CASCADE,
  relation TEXT,
  strength REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proactive signals
CREATE TABLE IF NOT EXISTS proactive_signals (
  id TEXT PRIMARY KEY,
  type TEXT,
  trigger_time TEXT,
  message TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed initial data ────────────────────────────────────────────────────────

INSERT INTO portrait (
  id, name, identity, "values", principles, strengths, blind_spots, dreams, relationships,
  decision_patterns, growth, cognitive_profile, active_beliefs
) VALUES (
  'user_1',
  'William',
  'Architect, systems builder, and creative technologist.',
  'Autonomy, deep focus, aesthetic excellence, continuous mastery.',
  'Build systems that scale leverage. Prioritize long-term clarity over short-term noise.',
  'System design, rapid execution, synthetic reasoning.',
  'Occasional over-engineering before simple verification.',
  'Craft a seamless, high-agency personal AI companion operating in real-time.',
  'Key collaborators, research team, family.',
  '["Prefers top-down architectural mental models", "Iterates through rapid prototype feedback"]',
  '["Transitioning from raw task execution to systemic delegation"]',
  '{"problemSolvingStyle":"System-builder (architectural foundations over ad-hoc scripts)","temporalBias":"High focus on 3-month strategic compounding","attentionSpan":"90-minute high-intensity deep work blocks","decisionHeuristics":"Code-first empirical validation"}',
  '[{"belief":"Clarity of mind follows environment organization","strength":0.92,"category":"cognition"},{"belief":"Small daily system refinements compound exponentially","strength":0.95,"category":"habit"}]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO journeys (id, category, icon, title, current_state, vision, milestones, memories, lessons, progress, timeline) VALUES
(
  'j_mental_1', 'mental', 'Brain', 'Cognitive Architecture & Focus',
  'Designing seamless AI companion memory and focus state loops.',
  'Achieve effortless deep flow with zero cognitive friction.',
  '["Build Memory Graph", "Implement Focus Mode", "Sync Mobile & Web"]',
  '["First successful graph visualization", "Clean theme sync"]',
  '["Systems beat willpower every time."]',
  75,
  '[{"date":"2026-07-20","text":"Completed Observer Sync and Action Dispatcher."}]'
),
(
  'j_health_1', 'health', 'Zap', 'High Energy & Recovery Cycles',
  'Maintaining 90-minute focus blocks with deliberate rest intervals.',
  'Sustained high cognitive output without burnout.',
  '["Track circadian energy peaks", "Automate evening shutdown"]',
  '["Discovered morning deep work sweet spot"]',
  '["Rest is an active performance multiplier."]',
  60,
  '[{"date":"2026-07-19","text":"Integrated circadian energy tracking."}]'
),
(
  'j_career_1', 'career', 'Target', 'William Companion Platform',
  'Shipping v2 companion with full mobile/web parity.',
  'An indispensable, zero-latency companion on all devices.',
  '["Web dashboard polish", "Mobile app parity", "Supabase migration"]',
  '["First mobile gesture prototype"]',
  '["Aesthetics and speed build trust."]',
  85,
  '[{"date":"2026-07-21","text":"Upgraded to Next.js + D3 cognitive orb + Supabase."}]'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO library (id, type, title, author, content, date_added, tags) VALUES
(
  'l_1', 'lesson', 'Systems Over Motivation', 'William',
  'When routines break after periods of high stress, redesign your environment instead of relying on raw motivation.',
  '2026-07-20',
  '["Systems", "Focus", "Self-Actualization"]'
),
(
  'l_2', 'idea', 'Companion Platform Vision', 'William',
  'A true AI companion does not wait for prompts; it observes patterns, anticipates bottlenecks, and keeps memory context clean.',
  '2026-07-21',
  '["AI Architecture", "William", "Philosophy"]'
) ON CONFLICT (id) DO NOTHING;
