-- Comprehensive Security Fixes Migration
-- Phase 3: Complete security hardening

-- 1. SECURE ANALYTICS TABLES
-- Enable RLS on analytics tables that currently don't have it
ALTER TABLE public.agent_listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_usage_stats ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_listeners
CREATE POLICY "Users can view their own agent listener data" 
ON public.agent_listeners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent listener data" 
ON public.agent_listeners 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Create RLS policies for agent_usage_stats  
CREATE POLICY "Agent owners can view their agent usage stats" 
ON public.agent_usage_stats 
FOR SELECT 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all agent usage stats" 
ON public.agent_usage_stats 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Create RLS policies for user_usage_stats
CREATE POLICY "Users can view their own usage stats" 
ON public.user_usage_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user usage stats" 
ON public.user_usage_stats 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- 2. FIX ANONYMOUS ACCESS - AGENT ACCESS TABLES
-- Fix agent_access table policies
DROP POLICY IF EXISTS "Users can view their own access" ON public.agent_access;
DROP POLICY IF EXISTS "Owners can view access for their agents" ON public.agent_access;
DROP POLICY IF EXISTS "Admins can view all access" ON public.agent_access;
DROP POLICY IF EXISTS "Owners can manage access for their agents" ON public.agent_access;
DROP POLICY IF EXISTS "Admins can manage all access" ON public.agent_access;

CREATE POLICY "Authenticated users can view their own access" 
ON public.agent_access 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated owners can view access for their agents" 
ON public.agent_access 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_access.agent_id 
  AND agents.owner_user_id = auth.uid()
));

CREATE POLICY "Authenticated admins can view all access" 
ON public.agent_access 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated owners can manage access for their agents" 
ON public.agent_access 
FOR ALL 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_access.agent_id 
  AND agents.owner_user_id = auth.uid()
));

CREATE POLICY "Authenticated admins can manage all access" 
ON public.agent_access 
FOR ALL 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

-- Fix agent_access_requests table policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.agent_access_requests;
DROP POLICY IF EXISTS "Owners can view requests for their agents" ON public.agent_access_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.agent_access_requests;
DROP POLICY IF EXISTS "Users can create access requests" ON public.agent_access_requests;
DROP POLICY IF EXISTS "Owners can update requests for their agents" ON public.agent_access_requests;  
DROP POLICY IF EXISTS "Admins can update all requests" ON public.agent_access_requests;

CREATE POLICY "Authenticated users can view their own requests" 
ON public.agent_access_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = requested_by);

CREATE POLICY "Authenticated owners can view requests for their agents" 
ON public.agent_access_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_access_requests.agent_id 
  AND agents.owner_user_id = auth.uid()
));

CREATE POLICY "Authenticated admins can view all requests" 
ON public.agent_access_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated users can create access requests" 
ON public.agent_access_requests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = requested_by);

CREATE POLICY "Authenticated owners can update requests for their agents" 
ON public.agent_access_requests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_access_requests.agent_id 
  AND agents.owner_user_id = auth.uid()
));

CREATE POLICY "Authenticated admins can update all requests" 
ON public.agent_access_requests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

-- Fix agent_submissions table policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.agent_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.agent_submissions;
DROP POLICY IF EXISTS "Users can create submissions for their agents" ON public.agent_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.agent_submissions;

CREATE POLICY "Authenticated users can view their own submissions" 
ON public.agent_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = submitted_by);

CREATE POLICY "Authenticated admins can view all submissions" 
ON public.agent_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated users can create submissions for their agents" 
ON public.agent_submissions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = submitted_by 
  AND EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = agent_submissions.agent_id 
    AND agents.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated admins can update submissions" 
ON public.agent_submissions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

-- 3. FIX AGENTS TABLE ANONYMOUS ACCESS
DROP POLICY IF EXISTS "Authenticated users can view published agents" ON public.agents;
DROP POLICY IF EXISTS "Owners can view their own agents" ON public.agents;
DROP POLICY IF EXISTS "Admins can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Admins can update agents" ON public.agents;
DROP POLICY IF EXISTS "Super admins can delete agents" ON public.agents;

-- Restrict agent viewing to authenticated users only
CREATE POLICY "Authenticated users can view published agents" 
ON public.agents 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status = ANY(ARRAY['published'::text, 'active'::text, 'live'::text]) 
  AND visibility <> 'private'::text
);

CREATE POLICY "Authenticated owners can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = owner_user_id);

CREATE POLICY "Authenticated admins can insert agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated admins can update agents" 
ON public.agents 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated super admins can delete agents" 
ON public.agents 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND is_super_admin_user(auth.uid()));

-- 4. FIX CONVERSATION TURNS ANONYMOUS ACCESS
DROP POLICY IF EXISTS "Users can view their own conversation turns" ON public.conversation_turns;
DROP POLICY IF EXISTS "Users can create turns for their conversations" ON public.conversation_turns;
DROP POLICY IF EXISTS "Admins can view all conversation turns" ON public.conversation_turns;

CREATE POLICY "Authenticated users can view their own conversation turns" 
ON public.conversation_turns 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM conversation_sessions 
    WHERE conversation_sessions.id = conversation_turns.conversation_id 
    AND conversation_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create turns for their conversations" 
ON public.conversation_turns 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM conversation_sessions 
    WHERE conversation_sessions.id = conversation_turns.conversation_id 
    AND conversation_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated admins can view all conversation turns" 
ON public.conversation_turns 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.is_admin = true OR profiles.is_super_admin = true)
  )
);

-- 5. FIX PROFILES ANONYMOUS ACCESS
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile admin status" ON public.profiles;

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated super admins can update any profile admin status" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles profiles_1 
    WHERE profiles_1.user_id = auth.uid() 
    AND profiles_1.is_super_admin = true
  )
);