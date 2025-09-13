-- Fix security vulnerabilities and database relationships

-- First, add role column to profiles table for admin functionality
ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user';

-- Add foreign key constraints to conversations table
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_agent_id_fkey 
FOREIGN KEY (agent_id) REFERENCES public.agents(id);

-- Create security functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = check_user_id 
    AND role = 'super_admin'
  );
$$;

-- Update profiles RLS policies to fix email exposure vulnerability
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Update agents RLS policies to fix security vulnerability
DROP POLICY IF EXISTS "Anyone can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Anyone can update agents" ON public.agents;
DROP POLICY IF EXISTS "Anyone can delete agents" ON public.agents;

CREATE POLICY "Admins can insert agents"
ON public.agents
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update agents"
ON public.agents
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Super admins can delete agents"
ON public.agents
FOR DELETE
TO authenticated
USING (public.is_super_admin_user(auth.uid()));

-- Create an initial super admin user (update this email to match your admin email)
INSERT INTO public.profiles (user_id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'System Admin', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- Update the handle_new_user function to handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'super_admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;