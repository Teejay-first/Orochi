-- Allow anonymous/public to view running and testing agents
CREATE POLICY IF NOT EXISTS "Public can view running and testing agents"
ON public.agents
FOR SELECT
USING (
  status_type IN ('deployed', 'testing')
  AND visibility <> 'private'::text
);

-- Keep authenticated users able to see additional statuses via existing policy
-- No changes to update/delete policies.