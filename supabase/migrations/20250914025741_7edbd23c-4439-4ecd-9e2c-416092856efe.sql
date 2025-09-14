-- Create or update agents table structure
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  model text NOT NULL DEFAULT 'gpt-realtime-2025-08-28',
  voice text NOT NULL,
  prompt_id text,
  prompt_text text,
  prompt_source text NOT NULL,
  language text NOT NULL,
  tagline text NOT NULL,
  avatar_url text NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  owner_user_id uuid,
  provider text NOT NULL DEFAULT 'openai_realtime',
  provider_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','suspended')),
  visibility text DEFAULT 'listed' CHECK (visibility IN ('listed','unlisted')),
  access_mode text DEFAULT 'open' CHECK (access_mode IN ('open','request','private')),
  is_featured boolean DEFAULT false,
  short_desc text,
  category text NOT NULL,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table with proper structure
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  transcript jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create conversation_sessions table for detailed session tracking
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  agent_id uuid,
  session_id text,
  transport text DEFAULT 'webrtc',
  model text DEFAULT 'gpt-realtime-2025-08-28',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms bigint,
  turns integer DEFAULT 0,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  cached_input_tokens integer DEFAULT 0,
  total_tokens integer,
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  transcript jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_turns table
CREATE TABLE IF NOT EXISTS public.conversation_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  turn_index integer NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  user_text text,
  assistant_text text,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  cached_input_tokens integer DEFAULT 0,
  raw_usage jsonb,
  raw_meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conv_user ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_sessions_user ON public.conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_turns_conv ON public.conversation_turns(conversation_id);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_turns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.conversations
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON public.conversations
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid()
));

-- RLS Policies for conversation_sessions
CREATE POLICY "Users can view their own conversation sessions" ON public.conversation_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation sessions" ON public.conversation_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" ON public.conversation_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversation sessions" ON public.conversation_sessions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND (is_admin = true OR is_super_admin = true)
));

CREATE POLICY "Admins can delete conversation sessions" ON public.conversation_sessions
FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND (is_admin = true OR is_super_admin = true)
));

-- RLS Policies for conversation_turns
CREATE POLICY "Users can view their own conversation turns" ON public.conversation_turns
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.conversation_sessions 
  WHERE id = conversation_turns.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create turns for their conversations" ON public.conversation_turns
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversation_sessions 
  WHERE id = conversation_turns.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Admins can view all conversation turns" ON public.conversation_turns
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND (is_admin = true OR is_super_admin = true)
));

-- Update triggers for timestamps
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at
BEFORE UPDATE ON public.conversation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();