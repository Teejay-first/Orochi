-- Add average_rating column to agents table
ALTER TABLE public.agents 
ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0;

-- Update the trigger function to calculate average rating from voice_naturality, accuracy, response_speed
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    -- Calculate average rating from voice_naturality, accuracy, response_speed (1-5 scale)
    average_rating = COALESCE((
      SELECT ROUND(
        (AVG(COALESCE(voice_naturality, 0)) + 
         AVG(COALESCE(accuracy, 0)) + 
         AVG(COALESCE(response_speed, 0))) / 3.0, 1
      )
      FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id 
      AND (voice_naturality IS NOT NULL OR accuracy IS NOT NULL OR response_speed IS NOT NULL)
    ), 0.0),
    updated_at = now()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$function$;