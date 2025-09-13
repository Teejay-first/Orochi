-- Create invite codes table
CREATE TABLE public.invite_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  uses_remaining integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on invite codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for invite codes
CREATE POLICY "Anyone can select invite codes for validation"
ON public.invite_codes
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert invite codes"
ON public.invite_codes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update invite codes"
ON public.invite_codes
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete invite codes"
ON public.invite_codes
FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_invite_codes_updated_at
BEFORE UPDATE ON public.invite_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample invite codes
INSERT INTO public.invite_codes (code, uses_remaining) VALUES 
('WELCOME2025', 100),
('BETA123', 50),
('EARLYACCESS', 25);