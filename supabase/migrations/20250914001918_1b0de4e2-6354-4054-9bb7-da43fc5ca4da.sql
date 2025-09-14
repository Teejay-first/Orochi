-- Remove the public SELECT policy that exposes all invite codes
DROP POLICY IF EXISTS "Anyone can select invite codes for validation" ON public.invite_codes;

-- Create a secure function to validate invite codes without exposing them
CREATE OR REPLACE FUNCTION public.validate_invite_code(code_to_check text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Check if code exists and has uses remaining (without exposing the code)
  IF EXISTS (
    SELECT 1 FROM invite_codes 
    WHERE code = upper(trim(code_to_check)) 
    AND uses_remaining > 0
  ) THEN
    result := json_build_object(
      'valid', true,
      'message', 'Invite code is valid'
    );
  ELSE
    -- Check if code exists but has no uses remaining
    IF EXISTS (SELECT 1 FROM invite_codes WHERE code = upper(trim(code_to_check))) THEN
      result := json_build_object(
        'valid', false,
        'message', 'This invite code has been used up'
      );
    ELSE
      result := json_build_object(
        'valid', false,
        'message', 'Invalid invite code'
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$;