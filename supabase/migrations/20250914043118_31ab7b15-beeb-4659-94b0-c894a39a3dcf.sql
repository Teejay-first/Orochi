-- Allow anonymous/public to view running and testing agents
CREATE POLICY "Public can view running and testing agents"
ON public.agents
FOR SELECT
USING (
  status_type IN ('deployed', 'testing')
  AND visibility <> 'private'::text
);