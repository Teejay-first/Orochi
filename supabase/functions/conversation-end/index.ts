import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { conversationId, endedAt } = await req.json();

    console.log('Ending conversation:', { conversationId, endedAt });

    // Get the conversation to calculate duration
    const { data: conversation, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('started_at')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      throw fetchError;
    }

    const startTime = new Date(conversation.started_at);
    const endTime = new Date(endedAt);
    const durationMs = endTime.getTime() - startTime.getTime();

    // Update conversation with end time and duration
    const { data, error } = await supabase
      .from('conversation_sessions')
      .update({
        ended_at: endedAt,
        duration_ms: durationMs,
        status: 'ended',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }

    console.log('Conversation ended successfully:', { 
      conversationId, 
      durationMs: durationMs,
      durationMinutes: Math.round(durationMs / 60000 * 100) / 100
    });

    return new Response(JSON.stringify({ 
      success: true, 
      conversation: data,
      duration_ms: durationMs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error ending conversation:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});