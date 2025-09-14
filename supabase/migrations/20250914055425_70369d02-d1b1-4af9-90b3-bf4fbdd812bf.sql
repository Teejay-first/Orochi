-- First drop the default value and any existing constraint
ALTER TABLE public.agents ALTER COLUMN agent_price DROP DEFAULT;

-- Update agent_price column to use integer values 1-4 instead of text
ALTER TABLE public.agents ALTER COLUMN agent_price TYPE integer USING 
  CASE 
    WHEN agent_price::text = 'budget' THEN 1
    WHEN agent_price::text = 'standard' THEN 2  
    WHEN agent_price::text = 'premium' THEN 3
    ELSE NULL
  END;

-- Add constraint to ensure only values 1-4 are allowed
ALTER TABLE public.agents ADD CONSTRAINT check_agent_price_range 
  CHECK (agent_price IS NULL OR (agent_price >= 1 AND agent_price <= 4));

-- Add comment to document the price levels
COMMENT ON COLUMN public.agents.agent_price IS 'Price tier: 1=$, 2=$$, 3=$$$, 4=$$$$';