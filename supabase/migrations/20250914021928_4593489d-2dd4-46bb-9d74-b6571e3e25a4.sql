-- Fix role consistency for admin users
UPDATE profiles 
SET role = 'super_admin' 
WHERE user_id = 'db55faaf-0c3e-4d5d-8d05-cbde811bdf98' AND email = 'p@pawelai.pl';

UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'e9498052-8cde-4a09-bd77-1e3c30ccc1d7' AND email = 'pawel@limitlessmind.ai';