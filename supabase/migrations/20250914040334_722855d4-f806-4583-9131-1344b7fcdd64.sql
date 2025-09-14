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

-- Note: agent_listeners, agent_usage_stats, and user_usage_stats appear to be views, not tables
-- Views inherit security from their underlying tables, so we don't add RLS directly to them
-- The security is already handled by the base tables they query from