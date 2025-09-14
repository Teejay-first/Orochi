-- Phase 2 Security Fixes: Address Anonymous Access Warnings

-- Fix invite_codes table: Remove anonymous access entirely
-- Invite codes should only be accessible to admins, never to anonymous users
DROP POLICY IF EXISTS "Admins can insert invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Admins can update invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Admins can delete invite codes" ON public.invite_codes;

-- Recreate with stricter policies that require authenticated admin users
CREATE POLICY "Authenticated admins can insert invite codes" 
ON public.invite_codes 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND is_admin_user(auth.uid())
);

CREATE POLICY "Authenticated admins can update invite codes" 
ON public.invite_codes 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND is_admin_user(auth.uid())
);

CREATE POLICY "Authenticated admins can delete invite codes" 
ON public.invite_codes 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL 
  AND is_admin_user(auth.uid())
);

CREATE POLICY "Authenticated admins can view invite codes" 
ON public.invite_codes 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_admin_user(auth.uid())
);

-- Fix conversation_sessions: Ensure all policies require authentication
-- These tables should never allow anonymous access
DROP POLICY IF EXISTS "Users can create their own conversation sessions" ON public.conversation_sessions;
CREATE POLICY "Authenticated users can create their own conversation sessions" 
ON public.conversation_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can view their own conversation sessions" ON public.conversation_sessions;
CREATE POLICY "Authenticated users can view their own conversation sessions" 
ON public.conversation_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update their own conversation sessions" ON public.conversation_sessions;
CREATE POLICY "Authenticated users can update their own conversation sessions" 
ON public.conversation_sessions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Fix conversations table
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Authenticated users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Authenticated users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);