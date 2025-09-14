-- Ensure the superadmin user has the correct flags
UPDATE public.profiles 
SET is_admin = true, is_super_admin = true 
WHERE email = 'p@pawelai.pl';