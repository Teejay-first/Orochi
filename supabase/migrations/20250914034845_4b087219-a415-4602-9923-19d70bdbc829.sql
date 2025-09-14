-- Change language field to support multiple languages as array
ALTER TABLE public.agents 
ALTER COLUMN language TYPE text[] USING ARRAY[language];

-- Update existing agents to have language as array if any exist
UPDATE public.agents 
SET language = ARRAY[language::text] 
WHERE cardinality(language) = 0 OR language IS NULL;