-- Add public policy for viewing agent ratings (needed for rating display on agent cards)
CREATE POLICY "Public can view agent ratings for rating calculation" 
ON public.agent_ratings 
FOR SELECT 
USING (true);