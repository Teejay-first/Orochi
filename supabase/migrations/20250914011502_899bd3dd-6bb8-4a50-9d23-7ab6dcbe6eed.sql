-- Set p@pawelai.pl as super admin
UPDATE public.profiles 
SET is_super_admin = true, is_admin = true 
WHERE email = 'p@pawelai.pl';