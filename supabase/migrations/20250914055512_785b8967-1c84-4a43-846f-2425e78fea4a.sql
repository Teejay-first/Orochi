-- Remove the default constraint first
ALTER TABLE public.agents ALTER COLUMN agent_price DROP DEFAULT;

-- Add temporary column for the conversion
ALTER TABLE public.agents ADD COLUMN agent_price_temp integer;

-- Update the temporary column with converted values
UPDATE public.agents SET agent_price_temp = 
  CASE 
    WHEN agent_price = 'budget' THEN 1
    WHEN agent_price = 'standard' THEN 2  
    WHEN agent_price = 'premium' THEN 3
    ELSE NULL
  END;

-- Drop the old column and rename the temporary one
ALTER TABLE public.agents DROP COLUMN agent_price;
ALTER TABLE public.agents RENAME COLUMN agent_price_temp TO agent_price;

-- Add constraint to ensure only values 1-4 are allowed
ALTER TABLE public.agents ADD CONSTRAINT check_agent_price_range 
  CHECK (agent_price IS NULL OR (agent_price >= 1 AND agent_price <= 4));

-- Add comment to document the price levels
COMMENT ON COLUMN public.agents.agent_price IS 'Price tier: 1=$, 2=$$, 3=$$$, 4=$$$$';