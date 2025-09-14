-- Enable RLS on new tables and create policies
ALTER TABLE public.agent_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_access ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.agent_access_requests ENABLE ROW LEVEL SECURITY;

-- Policies for agent_submissions
CREATE POLICY "Users can view their own submissions" 
ON public.agent_submissions FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all submissions" 
ON public.agent_submissions FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can create submissions for their agents" 
ON public.agent_submissions FOR INSERT 
WITH CHECK (
  auth.uid() = submitted_by AND 
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND owner_user_id = auth.uid())
);

CREATE POLICY "Admins can update submissions" 
ON public.agent_submissions FOR UPDATE 
USING (is_admin_user(auth.uid()));

-- Policies for agent_access
CREATE POLICY "Users can view their own access" 
ON public.agent_access FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Owners can view access for their agents" 
ON public.agent_access FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND owner_user_id = auth.uid())
);

CREATE POLICY "Admins can view all access" 
ON public.agent_access FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Owners can manage access for their agents" 
ON public.agent_access FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND owner_user_id = auth.uid())
);

CREATE POLICY "Admins can manage all access" 
ON public.agent_access FOR ALL 
USING (is_admin_user(auth.uid()));

-- Policies for agent_access_requests
CREATE POLICY "Users can view their own requests" 
ON public.agent_access_requests FOR SELECT 
USING (auth.uid() = requested_by);

CREATE POLICY "Owners can view requests for their agents" 
ON public.agent_access_requests FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND owner_user_id = auth.uid())
);

CREATE POLICY "Admins can view all requests" 
ON public.agent_access_requests FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can create access requests" 
ON public.agent_access_requests FOR INSERT 
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Owners can update requests for their agents" 
ON public.agent_access_requests FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND owner_user_id = auth.uid())
);

CREATE POLICY "Admins can update all requests" 
ON public.agent_access_requests FOR UPDATE 
USING (is_admin_user(auth.uid()));