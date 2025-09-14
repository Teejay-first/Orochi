import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { agentId, providerConfig } = await req.json();
    
    if (!agentId) {
      throw new Error('Agent ID required');
    }

    // Get agent and check access
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Check access permissions
    if (agent.status !== 'approved') {
      throw new Error('Agent not approved');
    }

    // Check access mode
    if (agent.access_mode === 'private') {
      const { data: access } = await supabase
        .from('agent_access')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .eq('status', 'granted')
        .single();

      if (!access) {
        throw new Error('Access denied');
      }
    } else if (agent.access_mode === 'request') {
      const { data: access } = await supabase
        .from('agent_access')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .eq('status', 'granted')
        .single();

      if (!access) {
        throw new Error('Access request required');
      }
    }

    // Create ephemeral token based on provider
    let sessionData;
    
    if (agent.provider === 'openai_realtime') {
      // Create OpenAI Realtime session
      const sessionResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: agent.model || "gpt-4o-realtime-preview-2024-12-17",
          voice: agent.voice || "alloy",
          instructions: agent.prompt_text || agent.settings?.instructions || "You are a helpful assistant.",
          ...providerConfig
        }),
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('OpenAI session creation failed:', errorText);
        throw new Error(`Failed to create OpenAI session: ${errorText}`);
      }

      sessionData = await sessionResponse.json();
      
      // Create conversation session record
      const { data: conversation, error: convError } = await supabase
        .from('conversation_sessions')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          session_id: sessionData.id,
          transport: 'webrtc',
          model: agent.model,
          status: 'active'
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create conversation record:', convError);
        throw convError;
      }

      return new Response(JSON.stringify({
        success: true,
        provider: 'openai_realtime',
        token: sessionData.client_secret.value,
        conversationId: conversation.id,
        sessionId: sessionData.id,
        expires_at: sessionData.expires_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Provider ${agent.provider} not implemented`);

  } catch (error) {
    console.error("Error in realtime-session:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});