-- Create agents table with extended fields for VoiceAgents system
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  model text NOT NULL DEFAULT 'gpt-realtime',
  voice text DEFAULT 'alloy',
  prompt_id text,
  settings jsonb DEFAULT '{}'::jsonb,
  owner_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'openai_realtime',
  provider_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','suspended')),
  visibility text NOT NULL DEFAULT 'listed' CHECK (visibility IN ('listed','unlisted')),
  access_mode text NOT NULL DEFAULT 'open' CHECK (access_mode IN ('open','request','private')),
  is_featured boolean NOT NULL DEFAULT false,
  short_desc text,
  category text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table for session tracking
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  session_id text,
  transport text,
  model text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms bigint,
  turns int DEFAULT 0,
  input_tokens int DEFAULT 0,
  output_tokens int DEFAULT 0,
  cached_input_tokens int DEFAULT 0,
  total_tokens int GENERATED ALWAYS AS ((coalesce(input_tokens,0)+coalesce(output_tokens,0))) STORED,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation turns for detailed tracking
CREATE TABLE IF NOT EXISTS public.conversation_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  turn_index int NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  user_text text,
  assistant_text text,
  input_tokens int DEFAULT 0,
  output_tokens int DEFAULT 0,
  cached_input_tokens int DEFAULT 0,
  raw_usage jsonb,
  raw_meta jsonb,
  created_at timestamptz DEFAULT now()
);

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

-- Create helpful views for analytics
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
LEFT JOIN public.conversations c ON c.user_id = u.user_id
GROUP BY u.user_id, u.email, u.full_name, u.created_at, u.is_admin, u.is_super_admin;

CREATE OR REPLACE VIEW public.agent_usage_stats AS
SELECT a.id as agent_id, a.name, a.owner_user_id,
       COUNT(c.id) as conversations,
       COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) as minutes,
       COALESCE(SUM(c.input_tokens),0) as input_tokens,
       COALESCE(SUM(c.output_tokens),0) as output_tokens,
       COALESCE(SUM(c.cached_input_tokens),0) as cached_tokens
FROM public.agents a
LEFT JOIN public.conversations c ON c.agent_id = a.id
GROUP BY a.id, a.name, a.owner_user_id;

CREATE OR REPLACE VIEW public.agent_listeners AS
SELECT c.agent_id, c.user_id,
       MIN(c.started_at) first_seen, MAX(c.ended_at) last_seen,
       COUNT(*) sessions,
       COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) minutes
FROM public.conversations c
GROUP BY c.agent_id, c.user_id;

-- Add triggers for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();