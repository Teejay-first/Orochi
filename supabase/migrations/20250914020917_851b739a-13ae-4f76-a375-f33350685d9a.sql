-- Ensure p@pawel.ai has proper admin privileges
UPDATE profiles 
SET is_admin = true, is_super_admin = true, role = 'super_admin'
WHERE email = 'p@pawel.ai';

-- If the user doesn't exist yet, we need to handle it when they first sign in
-- The handle_new_user function will set them as super admin automatically based on email