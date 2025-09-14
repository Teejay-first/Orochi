-- Update existing agents table for VoiceAgents system
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'openai_realtime',
ADD COLUMN IF NOT EXISTS provider_config jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','suspended')),
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'listed' CHECK (visibility IN ('listed','unlisted')),
ADD COLUMN IF NOT EXISTS access_mode text DEFAULT 'open' CHECK (access_mode IN ('open','request','private')),
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS short_desc text,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS tags text[];

-- Add unique constraint on slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agents_slug_key') THEN
        ALTER TABLE public.agents ADD CONSTRAINT agents_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Create agent submissions for approval workflow  
CREATE TABLE IF NOT EXISTS public.agent_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  decided_by uuid REFERENCES public.profiles(user_id),
  decided_at timestamptz,
  decision_reason text
);

-- Create agent access control
CREATE TABLE IF NOT EXISTS public.agent_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','manager','viewer')),
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted','revoked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Create agent access requests
CREATE TABLE IF NOT EXISTS public.agent_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  decided_by uuid REFERENCES public.profiles(user_id),
  decided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, requested_by, status) DEFERRABLE INITIALLY DEFERRED
);

-- Update existing user_usage_stats view to work with conversation_sessions
DROP VIEW IF EXISTS public.user_usage_stats;
CREATE OR REPLACE VIEW public.user_usage_stats AS
SELECT u.user_id, u.email, u.full_name,
       COUNT(c.id) as conversations_count,
       COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) as total_minutes,
       COALESCE(SUM(c.input_tokens),0) as total_input_tokens,
       COALESCE(SUM(c.output_tokens),0) as total_output_tokens,
       COALESCE(SUM(c.cached_input_tokens),0) as total_cached_tokens,
       u.created_at as user_created_at,
       u.is_admin,
       u.is_super_admin
FROM public.profiles u
LEFT JOIN public.conversation_sessions c ON c.user_id = u.user_id
GROUP BY u.user_id, u.email, u.full_name, u.created_at, u.is_admin, u.is_super_admin;

-- Create agent usage stats view  
CREATE OR REPLACE VIEW public.agent_usage_stats AS
SELECT a.id as agent_id, a.name, a.owner_user_id,
       COUNT(c.id) as conversations,
       COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) as minutes,
       COALESCE(SUM(c.input_tokens),0) as input_tokens,
       COALESCE(SUM(c.output_tokens),0) as output_tokens,
       COALESCE(SUM(c.cached_input_tokens),0) as cached_tokens
FROM public.agents a
LEFT JOIN public.conversation_sessions c ON c.agent_id = a.id
GROUP BY a.id, a.name, a.owner_user_id;

-- Create agent listeners view
CREATE OR REPLACE VIEW public.agent_listeners AS
SELECT c.agent_id, c.user_id,
       MIN(c.started_at) first_seen, MAX(c.ended_at) last_seen,
       COUNT(*) sessions,
       COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) minutes
FROM public.conversation_sessions c
GROUP BY c.agent_id, c.user_id;