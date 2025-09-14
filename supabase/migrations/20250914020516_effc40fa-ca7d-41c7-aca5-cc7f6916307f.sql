-- Set p@pawel.ai as superadmin
UPDATE profiles 
SET is_admin = true, is_super_admin = true, role = 'super_admin'
WHERE email = 'p@pawel.ai';

-- If the user doesn't exist yet, we'll handle it when they first sign in
-- The handle_new_user function will create their profile automatically