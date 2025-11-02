-- Add multi-provider support and sync tracking
-- Generated at: 2025-01-15

-- Create provider_connections table to store API keys
CREATE TABLE IF NOT EXISTS public.provider_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('vapi', 'elevenlabs', 'orochi')),
  label TEXT, -- User-defined label like "Production", "Staging"
  api_key TEXT NOT NULL,
  org_id TEXT, -- Provider's organization ID (if applicable)
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, provider, label)
);

-- Add RLS policies for provider_connections
ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own provider connections"
  ON public.provider_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider connections"
  ON public.provider_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider connections"
  ON public.provider_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider connections"
  ON public.provider_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add sync tracking fields to agents table
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider_assistant_id TEXT, -- Remote ID at the provider (e.g., Vapi assistant ID)
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'unsynced' CHECK (sync_status IN ('synced', 'unsynced', 'syncing', 'error')),
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_synced_hash TEXT, -- Hash of last synced data for change detection
  ADD COLUMN IF NOT EXISTS local_changes JSONB DEFAULT '{}'::jsonb, -- Track what fields changed locally
  ADD COLUMN IF NOT EXISTS sync_error TEXT; -- Store last sync error message

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_provider_assistant_id ON public.agents(provider_assistant_id);
CREATE INDEX IF NOT EXISTS idx_agents_sync_status ON public.agents(sync_status);
CREATE INDEX IF NOT EXISTS idx_agents_provider_connection ON public.agents(provider_connection_id);

-- Create vapi_calls table to store call history
CREATE TABLE IF NOT EXISTS public.vapi_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_call_id TEXT NOT NULL, -- Vapi's call ID
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE SET NULL,
  phone_number TEXT,
  call_type TEXT CHECK (call_type IN ('inboundPhoneCall', 'outboundPhoneCall', 'webCall')),
  status TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  cost NUMERIC(10, 4),
  cost_breakdown JSONB DEFAULT '{}'::jsonb,
  transcript TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  recording_url TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider_call_id, provider_connection_id)
);

-- Add RLS policies for vapi_calls
ALTER TABLE public.vapi_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calls for their provider connections"
  ON public.vapi_calls
  FOR SELECT
  USING (
    provider_connection_id IN (
      SELECT id FROM public.provider_connections WHERE user_id = auth.uid()
    )
  );

-- Create index for faster call queries
CREATE INDEX IF NOT EXISTS idx_vapi_calls_agent_id ON public.vapi_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_provider_connection ON public.vapi_calls(provider_connection_id);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_started_at ON public.vapi_calls(started_at DESC);

-- Create vapi_phone_numbers table
CREATE TABLE IF NOT EXISTS public.vapi_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_number_id TEXT NOT NULL, -- Vapi's phone number ID
  provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  provider_type TEXT, -- 'vapi', 'twilio', 'vonage'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider_number_id, provider_connection_id)
);

-- Add RLS policies for vapi_phone_numbers
ALTER TABLE public.vapi_phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view phone numbers for their provider connections"
  ON public.vapi_phone_numbers
  FOR SELECT
  USING (
    provider_connection_id IN (
      SELECT id FROM public.provider_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage phone numbers for their provider connections"
  ON public.vapi_phone_numbers
  FOR ALL
  USING (
    provider_connection_id IN (
      SELECT id FROM public.provider_connections WHERE user_id = auth.uid()
    )
  );

-- Create vapi_files table for Knowledge Base
CREATE TABLE IF NOT EXISTS public.vapi_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_file_id TEXT NOT NULL, -- Vapi's file ID
  provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  file_type TEXT,
  size_bytes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider_file_id, provider_connection_id)
);

-- Add RLS policies for vapi_files
ALTER TABLE public.vapi_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files for their provider connections"
  ON public.vapi_files
  FOR SELECT
  USING (
    provider_connection_id IN (
      SELECT id FROM public.provider_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage files for their provider connections"
  ON public.vapi_files
  FOR ALL
  USING (
    provider_connection_id IN (
      SELECT id FROM public.provider_connections WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_provider_connections_updated_at
  BEFORE UPDATE ON public.provider_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vapi_calls_updated_at
  BEFORE UPDATE ON public.vapi_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vapi_phone_numbers_updated_at
  BEFORE UPDATE ON public.vapi_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vapi_files_updated_at
  BEFORE UPDATE ON public.vapi_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
