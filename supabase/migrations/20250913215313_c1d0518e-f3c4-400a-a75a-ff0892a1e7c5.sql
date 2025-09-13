-- Create RPC function to atomically validate and use invite codes
CREATE OR REPLACE FUNCTION use_invite_code(code_to_use text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Update the invite code and decrement uses_remaining atomically
  UPDATE invite_codes 
  SET uses_remaining = uses_remaining - 1,
      updated_at = now()
  WHERE code = upper(trim(code_to_use)) 
    AND uses_remaining > 0;
  
  -- Check if the update affected any rows
  IF FOUND THEN
    result := json_build_object(
      'success', true, 
      'message', 'Invite code used successfully'
    );
  ELSE
    -- Check if code exists but has no uses remaining
    IF EXISTS (SELECT 1 FROM invite_codes WHERE code = upper(trim(code_to_use))) THEN
      result := json_build_object(
        'success', false, 
        'message', 'This invite code has been used up'
      );
    ELSE
      result := json_build_object(
        'success', false, 
        'message', 'Invalid invite code'
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$;