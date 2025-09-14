-- Add rating fields to agents table
ALTER TABLE public.agents 
ADD COLUMN rating NUMERIC(4,2) DEFAULT 0.0,
ADD COLUMN total_thumbs_up INTEGER DEFAULT 0,
ADD COLUMN total_thumbs_down INTEGER DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Create agent_ratings table for individual rating records
CREATE TABLE public.agent_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  user_id UUID,
  session_id UUID,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('thumbs_up', 'thumbs_down')),
  voice_naturality INTEGER CHECK (voice_naturality >= 1 AND voice_naturality <= 5),
  accuracy INTEGER CHECK (accuracy >= 1 AND accuracy <= 5),
  response_speed INTEGER CHECK (response_speed >= 1 AND response_speed <= 5),
  feedback_tags TEXT[],
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agent_ratings
ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_ratings
CREATE POLICY "Authenticated users can create ratings" 
ON public.agent_ratings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own ratings" 
ON public.agent_ratings 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all ratings" 
ON public.agent_ratings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin_user(auth.uid()));

-- Create function to update agent rating
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new rating based on thumbs up/down
  UPDATE public.agents 
  SET 
    total_thumbs_up = (
      SELECT COUNT(*) FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id AND rating_type = 'thumbs_up'
    ),
    total_thumbs_down = (
      SELECT COUNT(*) FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id AND rating_type = 'thumbs_down'
    ),
    total_ratings = (
      SELECT COUNT(*) FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id
    ),
    rating = GREATEST(0, (
      SELECT COUNT(*) FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id AND rating_type = 'thumbs_up'
    ) - (
      SELECT COUNT(*) FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id AND rating_type = 'thumbs_down'
    )),
    updated_at = now()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic rating updates
CREATE TRIGGER update_agent_rating_trigger
AFTER INSERT ON public.agent_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_rating();

-- Create trigger for updated_at
CREATE TRIGGER update_agent_ratings_updated_at
BEFORE UPDATE ON public.agent_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();