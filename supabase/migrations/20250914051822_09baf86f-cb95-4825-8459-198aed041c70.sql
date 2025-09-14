-- Fix the agent rating calculation trigger function
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
    -- FIXED: Calculate average rating from voice_naturality, accuracy, response_speed (1-5 scale)
    -- Only include ratings where ALL three fields are not null (changed OR to AND)
    average_rating = COALESCE((
      SELECT ROUND(
        (AVG(COALESCE(voice_naturality, 0)) + 
         AVG(COALESCE(accuracy, 0)) + 
         AVG(COALESCE(response_speed, 0))) / 3.0, 1
      )
      FROM public.agent_ratings 
      WHERE agent_id = NEW.agent_id 
      AND voice_naturality IS NOT NULL 
      AND accuracy IS NOT NULL 
      AND response_speed IS NOT NULL
    ), 0.0),
    updated_at = now()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS agent_rating_update ON public.agent_ratings;
CREATE TRIGGER agent_rating_update
  AFTER INSERT OR UPDATE ON public.agent_ratings
  FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

-- Manually recalculate ratings for all existing agents
UPDATE public.agents 
SET 
  total_thumbs_up = (
    SELECT COUNT(*) FROM public.agent_ratings 
    WHERE agent_id = agents.id AND rating_type = 'thumbs_up'
  ),
  total_thumbs_down = (
    SELECT COUNT(*) FROM public.agent_ratings 
    WHERE agent_id = agents.id AND rating_type = 'thumbs_down'
  ),
  total_ratings = (
    SELECT COUNT(*) FROM public.agent_ratings 
    WHERE agent_id = agents.id
  ),
  rating = GREATEST(0, (
    SELECT COUNT(*) FROM public.agent_ratings 
    WHERE agent_id = agents.id AND rating_type = 'thumbs_up'
  ) - (
    SELECT COUNT(*) FROM public.agent_ratings 
    WHERE agent_id = agents.id AND rating_type = 'thumbs_down'
  )),
  average_rating = COALESCE((
    SELECT ROUND(
      (AVG(COALESCE(voice_naturality, 0)) + 
       AVG(COALESCE(accuracy, 0)) + 
       AVG(COALESCE(response_speed, 0))) / 3.0, 1
    )
    FROM public.agent_ratings 
    WHERE agent_id = agents.id 
    AND voice_naturality IS NOT NULL 
    AND accuracy IS NOT NULL 
    AND response_speed IS NOT NULL
  ), 0.0),
  updated_at = now();