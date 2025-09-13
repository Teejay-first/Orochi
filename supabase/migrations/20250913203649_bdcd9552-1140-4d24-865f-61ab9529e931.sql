-- Create agents table for persistent storage
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  prompt_source TEXT NOT NULL CHECK (prompt_source IN ('text', 'prompt_id')),
  prompt_text TEXT,
  prompt_id TEXT,
  voice TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gpt-realtime-2025-08-28',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (all users can read/manage agents)
CREATE POLICY "Agents are viewable by everyone" 
ON public.agents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update agents" 
ON public.agents 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete agents" 
ON public.agents 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();