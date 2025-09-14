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
    
    const { 
      conversationId, 
      turnIndex, 
      userText, 
      assistantText, 
      usage 
    } = await req.json();

    console.log('Recording conversation turn:', { conversationId, turnIndex, userText: userText?.substring(0, 50) });

    // Insert the turn
    const { data: turn, error: turnError } = await supabase
      .from('conversation_turns')
      .insert({
        conversation_id: conversationId,
        turn_index: turnIndex,
        completed_at: new Date().toISOString(),
        user_text: userText,
        assistant_text: assistantText,
        input_tokens: usage?.input_tokens || 0,
        output_tokens: usage?.output_tokens || 0,
        cached_input_tokens: usage?.input_tokens_details?.cached_tokens || 0,
        raw_usage: usage || {}
      })
      .select()
      .single();

    if (turnError) {
      console.error('Error inserting turn:', turnError);
      throw turnError;
    }

    // Update conversation aggregates
    const { error: updateError } = await supabase
      .from('conversation_sessions')
      .update({
        turns: turnIndex + 1,
        input_tokens: supabase.sql`input_tokens + ${usage?.input_tokens || 0}`,
        output_tokens: supabase.sql`output_tokens + ${usage?.output_tokens || 0}`,
        cached_input_tokens: supabase.sql`cached_input_tokens + ${usage?.input_tokens_details?.cached_tokens || 0}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      turn: turn 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error recording conversation turn:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});