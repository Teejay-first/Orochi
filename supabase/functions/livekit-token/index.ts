import { AgentDispatchClient, AccessToken, type VideoGrant } from "npm:livekit-server-sdk@^2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { room, identity } = await req.json();

    const LIVEKIT_URL = Deno.env.get("LIVEKIT_URL")!;
    const LIVEKIT_API_KEY = Deno.env.get("LIVEKIT_API_KEY")!;
    const LIVEKIT_API_SECRET = Deno.env.get("LIVEKIT_API_SECRET")!;
    const AGENT_ID = Deno.env.get("AGENT_ID") ?? "CA_pGYsjHJZSmxC";

    console.log(`Connecting to LiveKit agent: ${AGENT_ID}`);

    // 1) Create token for the web client
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: 3600, // 1h — TTL only impacts initial join
    });
    at.addGrant(<VideoGrant>{ roomJoin: true, room });

    // 2) Explicitly dispatch the agent into this room using the specific agent ID
    const dispatcher = new AgentDispatchClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    await dispatcher.createDispatch(room, AGENT_ID);

    const token = await at.toJwt();
    return new Response(JSON.stringify({ token, serverUrl: LIVEKIT_URL }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    console.error('Error in livekit-token function:', e);
    console.error('Error details:', {
      message: e?.message,
      stack: e?.stack,
      agentId: Deno.env.get("AGENT_ID"),
      livekitUrl: Deno.env.get("LIVEKIT_URL")
    });
    return new Response(JSON.stringify({ error: e?.message || "token error" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});