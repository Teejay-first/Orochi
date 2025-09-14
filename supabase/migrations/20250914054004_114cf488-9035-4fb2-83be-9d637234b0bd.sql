-- Add agent_price column to agents table
ALTER TABLE public.agents 
ADD COLUMN agent_price text DEFAULT 'budget' CHECK (agent_price IN ('budget', 'standard', 'premium'));