-- Add status column to agents table
ALTER TABLE public.agents 
ADD COLUMN status_type text DEFAULT 'deployed' CHECK (status_type IN ('deployed', 'testing', 'building', 'repairing'));