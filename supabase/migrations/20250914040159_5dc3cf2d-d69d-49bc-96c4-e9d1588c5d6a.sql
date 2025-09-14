-- CRITICAL SECURITY FIX: Restrict agent access to authenticated users only
-- Replace the overly permissive "Agents are viewable by everyone" policy

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON public.agents;

-- Create a new policy that requires authentication for full agent access
CREATE POLICY "Authenticated users can view published agents" 
ON public.agents 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status IN ('published', 'active', 'live')
  AND visibility != 'private'
);

-- Allow owners to view their own agents regardless of status
CREATE POLICY "Owners can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = owner_user_id);

-- Add RLS policies for agent_listeners table
ALTER TABLE public.agent_listeners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own listening stats" 
ON public.agent_listeners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all listening stats" 
ON public.agent_listeners 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "System can insert listening stats" 
ON public.agent_listeners 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update listening stats" 
ON public.agent_listeners 
FOR UPDATE 
USING (true);

-- Add RLS policies for agent_usage_stats table
ALTER TABLE public.agent_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent owners can view their agent stats" 
ON public.agent_usage_stats 
FOR SELECT 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all usage stats" 
ON public.agent_usage_stats 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Add RLS policies for user_usage_stats table
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage stats" 
ON public.user_usage_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user usage stats" 
ON public.user_usage_stats 
FOR SELECT 
USING (is_admin_user(auth.uid()));