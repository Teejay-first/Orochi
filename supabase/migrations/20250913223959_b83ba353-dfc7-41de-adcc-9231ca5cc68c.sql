-- Make email nullable in profiles table to support anonymous users
ALTER TABLE public.profiles 
ALTER COLUMN email DROP NOT NULL;

-- Update the trigger function to handle anonymous users properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email, -- This can now be NULL for anonymous users
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Invite User'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'super_admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$function$;