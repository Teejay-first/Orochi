import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AccessToken, AgentDispatchClient, type VideoGrant } from "npm:livekit-server-sdk@^2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { room, identity, agentName = Deno.env.get("AGENT_NAME") ?? "aristocratic_master_agent" } = await req.json();

    const roomName = String(room || `agent-demo-${Date.now()}`);
    const userIdentity = typeof identity === 'string' 
      ? identity 
      : `user-${Math.random().toString(36).slice(2, 8)}`;

    // Get LiveKit credentials from environment
    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL');

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      throw new Error('LiveKit credentials not configured');
    }

    console.log('Creating LiveKit token for:', { roomName, userIdentity, agentName });

    // Create token for the web client with 1 hour TTL
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userIdentity,
      ttl: 3600, // 1 hour - TTL only impacts initial join
    });

    const grant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(grant);

    // Explicitly dispatch the agent into this room with timeout
    try {
      console.log('Dispatching agent to room:', { roomName, agentName });
      const dispatcher = new AgentDispatchClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
      
      // Add 5 second timeout for dispatch to prevent hanging
      const dispatchPromise = dispatcher.createDispatch(roomName, agentName);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Agent dispatch timeout')), 5000)
      );
      
      await Promise.race([dispatchPromise, timeoutPromise]);
      console.log('Agent dispatched successfully');
    } catch (dispatchError) {
      console.error('Error dispatching agent:', dispatchError);
      // Continue with token generation even if dispatch fails
    }

    const token = await at.toJwt(); // v2 API is async
    
    console.log('LiveKit token created successfully');

    return new Response(JSON.stringify({ 
      token, 
      serverUrl: LIVEKIT_URL 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating LiveKit token:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create LiveKit token' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});