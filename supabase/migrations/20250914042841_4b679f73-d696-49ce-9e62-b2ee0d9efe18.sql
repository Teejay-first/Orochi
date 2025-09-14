-- Update RLS policy to include 'deployed' status (which maps to 'Running')
-- and fix the policy to check status_type field instead of status field
DROP POLICY IF EXISTS "Authenticated users can view published agents" ON public.agents;

CREATE POLICY "Authenticated users can view published agents" 
ON public.agents 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) 
  AND (status_type IN ('deployed', 'testing', 'building', 'repairing'))
  AND (visibility <> 'private'::text)
);