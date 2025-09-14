-- Add admin and super admin roles to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Create conversations table for tracking realtime sessions
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  session_id text,
  transport text DEFAULT 'webrtc',
  model text DEFAULT 'gpt-realtime-2025-08-28',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms bigint,
  turns int DEFAULT 0,
  input_tokens int DEFAULT 0,
  output_tokens int DEFAULT 0,
  cached_input_tokens int DEFAULT 0,
  total_tokens int GENERATED ALWAYS AS 
    ((coalesce(input_tokens,0) + coalesce(output_tokens,0))) STORED,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  transcript jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation turns table for detailed tracking
CREATE TABLE IF NOT EXISTS public.conversation_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  turn_index int NOT NULL,
  started_at timestamptz DEFAULT now(),
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

-- Enable RLS on new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_turns ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" 
ON public.conversations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR is_super_admin = true)
  )
);

CREATE POLICY "Admins can delete conversations" 
ON public.conversations FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- RLS policies for conversation turns
CREATE POLICY "Users can view their own conversation turns" 
ON public.conversation_turns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create turns for their conversations" 
ON public.conversation_turns FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all conversation turns" 
ON public.conversation_turns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR is_super_admin = true)
  )
);

-- Create user usage stats view
CREATE OR REPLACE VIEW public.user_usage_stats AS
SELECT
  u.id as user_id,
  p.email,
  p.full_name,
  p.is_admin,
  p.is_super_admin,
  COUNT(c.id) as conversations_count,
  COALESCE(SUM(c.duration_ms)/60000.0,0)::numeric(12,2) as total_minutes,
  COALESCE(SUM(c.input_tokens),0) as total_input_tokens,
  COALESCE(SUM(c.output_tokens),0) as total_output_tokens,
  COALESCE(SUM(c.cached_input_tokens),0) as total_cached_tokens,
  COALESCE(SUM(c.turns),0) as total_turns,
  p.created_at as user_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.conversations c ON c.user_id = u.id
GROUP BY u.id, p.email, p.full_name, p.is_admin, p.is_super_admin, p.created_at;

-- Update profile policies to handle admin management
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Users cannot change their own admin status
    (OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin)
    AND (OLD.is_super_admin IS NOT DISTINCT FROM NEW.is_super_admin)
  )
);

CREATE POLICY "Super admins can update any profile admin status" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

-- Set p@pawelai.pl as super admin
UPDATE public.profiles 
SET is_super_admin = true, is_admin = true
WHERE email = 'p@pawelai.pl';

-- If the profile doesn't exist, create it
INSERT INTO public.profiles (user_id, email, full_name, is_super_admin, is_admin)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data ->> 'full_name', 'Super Admin'),
  true,
  true
FROM auth.users u 
WHERE u.email = 'p@pawelai.pl'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'p@pawelai.pl');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON public.conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_turns_conversation_id ON public.conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(is_admin, is_super_admin);

-- Create updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions for admin checks
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = check_user_id 
    AND (is_admin = true OR is_super_admin = true)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = check_user_id 
    AND is_super_admin = true
  );
$$;