-- Fix security issues from the previous migration

-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.user_usage_stats;

-- Recreate the view without exposing auth.users and without SECURITY DEFINER
CREATE OR REPLACE VIEW public.user_usage_stats AS
SELECT
  p.user_id,
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
FROM public.profiles p
LEFT JOIN public.conversation_sessions c ON c.user_id = p.user_id
GROUP BY p.user_id, p.email, p.full_name, p.is_admin, p.is_super_admin, p.created_at;

-- Enable RLS on the view (inherited from underlying tables)
-- Note: Views inherit RLS from their underlying tables

-- Fix function search path issue
ALTER FUNCTION public.prevent_self_admin_change() SET search_path = public;

-- Update existing functions to have proper search path
ALTER FUNCTION public.is_admin_user(uuid) SET search_path = public;
ALTER FUNCTION public.is_super_admin_user(uuid) SET search_path = public;
ALTER FUNCTION public.use_invite_code(text) SET search_path = public;
ALTER FUNCTION public.validate_invite_code(text) SET search_path = public;