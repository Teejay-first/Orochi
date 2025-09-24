import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const body = await req.json();
    const {
      model = "gpt-realtime-2025-08-28",
      voice = "alloy",
      // NEW: prompt config from client
      prompt, // { id: string; version?: string; variables?: Record<string, unknown> }
      // Optional: direct instructions to override overlapping prompt fields
      instructions,
      // Optional: EU residency toggle
      region = "global" // or "eu"
    } = body;

    // Sanitize voice against supported list
    const supportedVoices = new Set([
      'alloy','ash','ballad','coral','echo','sage','shimmer','verse','marin','cedar'
    ]);
    const safeVoice = supportedVoices.has(voice) ? voice : 'alloy';

    const base = region === "eu" ? "https://eu.api.openai.com" : "https://api.openai.com";

    const sessionConfig = {
      model,
      voice: safeVoice,
      // You can seed session params here (same shape as `session.update`)
      session: {
        type: "realtime",
        ...(prompt ? { prompt } : {}),
        ...(instructions ? { instructions } : {}),
      },
      expires_in: 60, // ephemeral key TTL
    };

    console.log("Creating ephemeral token with config:", sessionConfig);

    // Request an ephemeral token from OpenAI
    const response = await fetch(`${base}/v1/realtime/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Token created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in realtime-token function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});