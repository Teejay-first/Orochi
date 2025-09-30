-- Fix database schema mismatch for agent configuration fields
-- Add missing columns to public.agents used by the Admin panel and AgentContext

BEGIN;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS instructions_override text,
  ADD COLUMN IF NOT EXISTS prompt_version text,
  ADD COLUMN IF NOT EXISTS prompt_variables jsonb DEFAULT '{}'::jsonb;

-- Ensure existing rows have a JSON object in prompt_variables
UPDATE public.agents
SET prompt_variables = '{}'::jsonb
WHERE prompt_variables IS NULL;

COMMIT;