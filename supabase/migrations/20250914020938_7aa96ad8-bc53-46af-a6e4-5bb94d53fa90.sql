-- Update the handle_new_user function to automatically set p@pawel.ai as super admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, role, is_admin, is_super_admin)
  VALUES (
    NEW.id,
    NEW.email, -- This can now be NULL for anonymous users
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Invite User'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    CASE 
      WHEN NEW.email = 'p@pawel.ai' THEN 'super_admin'
      WHEN NEW.email = 'admin@example.com' THEN 'super_admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email IN ('p@pawel.ai', 'admin@example.com') THEN true
      ELSE false
    END,
    CASE 
      WHEN NEW.email IN ('p@pawel.ai', 'admin@example.com') THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$function$;