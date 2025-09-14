-- Add admin and super admin roles to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Create conversation_sessions table for tracking realtime sessions
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
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
  conversation_id uuid REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
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
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_turns ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_sessions
CREATE POLICY "Users can view their own conversation sessions" 
ON public.conversation_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation sessions" 
ON public.conversation_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" 
ON public.conversation_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversation sessions" 
ON public.conversation_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR is_super_admin = true)
  )
);

CREATE POLICY "Admins can delete conversation sessions" 
ON public.conversation_sessions FOR DELETE 
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
    SELECT 1 FROM public.conversation_sessions 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create turns for their conversations" 
ON public.conversation_turns FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_sessions 
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
LEFT JOIN public.conversation_sessions c ON c.user_id = u.id
GROUP BY u.id, p.email, p.full_name, p.is_admin, p.is_super_admin, p.created_at;

-- Create function to prevent users from changing their own admin status
CREATE OR REPLACE FUNCTION public.prevent_self_admin_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is trying to change their own admin status, prevent it
  IF auth.uid() = NEW.user_id AND auth.uid() = OLD.user_id THEN
    -- Allow changes only if admin status remains the same
    IF OLD.is_admin != NEW.is_admin OR OLD.is_super_admin != NEW.is_super_admin THEN
      -- Check if user is super admin, only super admins can change admin status
      IF NOT (
        SELECT is_super_admin FROM public.profiles 
        WHERE user_id = auth.uid()
      ) THEN
        RAISE EXCEPTION 'Users cannot change their own admin status';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to prevent self admin status changes
CREATE TRIGGER prevent_self_admin_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_admin_change();

-- Update profile policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

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
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_agent_id ON public.conversation_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_started_at ON public.conversation_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_turns_conversation_id ON public.conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(is_admin, is_super_admin);

-- Create updated_at trigger for conversation sessions
CREATE TRIGGER update_conversation_sessions_updated_at
BEFORE UPDATE ON public.conversation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();