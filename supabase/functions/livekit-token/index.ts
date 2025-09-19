import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AccessToken, type VideoGrant } from "https://esm.sh/livekit-server-sdk@2.1.0";
import { RoomConfiguration, RoomAgentDispatch } from "https://esm.sh/@livekit/protocol@1.11.0";

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
    const { room, identity, agentName } = await req.json();

    const roomName = String(room || `agent-demo-${Date.now()}`);
    const userIdentity = typeof identity === 'string' 
      ? identity 
      : `user-${Math.random().toString(36).slice(2, 8)}`;

    const agentNameStr = typeof agentName === 'string' ? agentName : undefined;

    // Get LiveKit credentials from environment
    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL');

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      throw new Error('LiveKit credentials not configured');
    }

    console.log('Creating LiveKit token for:', { roomName, userIdentity, agentNameStr });

    // Mint a short-lived token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userIdentity,
      ttl: '10m',
    });

    const grant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(grant);

    // OPTIONAL: dispatch a server-side LiveKit Agent into the room on join
    if (agentNameStr) {
      at.roomConfig = new RoomConfiguration({
        agents: [new RoomAgentDispatch({ agentName: agentNameStr })],
      });
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