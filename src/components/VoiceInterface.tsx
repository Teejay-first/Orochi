import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types/voiceagents';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface VoiceInterfaceProps {
  agent: Agent;
  onSpeakingChange?: (speaking: boolean) => void;
  onTranscriptUpdate?: (transcript: any[]) => void;
}

interface RealtimeSession {
  conversationId: string;
  sessionId: string;
  token: string;
  pc?: RTCPeerConnection;
  dc?: RTCDataChannel;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  agent, 
  onSpeakingChange, 
  onTranscriptUpdate 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<any[]>([]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = document.createElement("audio");
    audioRef.current.autoplay = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
    };
  }, []);

  const handleRealtimeEvent = useCallback((event: any) => {
    console.log('Realtime event:', event);
    
    switch (event.type) {
      case 'session.created':
        console.log('Session created successfully');
        break;
        
      case 'input_audio_transcription.delta':
        // User speech transcription
        if (event.delta) {
          transcriptRef.current.push({
            type: 'user',
            text: event.delta,
            timestamp: new Date().toISOString()
          });
          onTranscriptUpdate?.(transcriptRef.current);
        }
        break;
        
      case 'response.audio_transcript.delta':
        // Assistant speech transcription
        if (event.delta) {
          transcriptRef.current.push({
            type: 'assistant',
            text: event.delta,
            timestamp: new Date().toISOString()
          });
          onTranscriptUpdate?.(transcriptRef.current);
        }
        break;
        
      case 'response.audio.delta':
        onSpeakingChange?.(true);
        break;
        
      case 'response.audio.done':
        onSpeakingChange?.(false);
        break;
        
      case 'response.done':
        // Record conversation turn with usage data
        if (event.usage) {
          recordConversationTurn(event);
        }
        break;
        
      case 'error':
        console.error('Realtime API error:', event);
        toast({
          title: "Voice Error",
          description: event.error?.message || 'An error occurred',
          variant: "destructive",
        });
        break;
    }
  }, [onSpeakingChange, onTranscriptUpdate]);

  const recordConversationTurn = async (responseEvent: any) => {
    if (!sessionRef.current) return;

    try {
      const userText = transcriptRef.current
        .filter(t => t.type === 'user')
        .map(t => t.text)
        .join(' ');
        
      const assistantText = transcriptRef.current
        .filter(t => t.type === 'assistant')
        .map(t => t.text)
        .join(' ');

      await supabase.functions.invoke('conversation-turn', {
        body: {
          conversationId: sessionRef.current.conversationId,
          turnIndex: transcriptRef.current.length,
          userText,
          assistantText,
          usage: responseEvent.usage
        }
      });
    } catch (error) {
      console.error('Failed to record conversation turn:', error);
    }
  };

  const startConversation = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get session token from our edge function
      const { data, error } = await supabase.functions.invoke('realtime-session', {
        body: { 
          agentId: agent.id,
          providerConfig: agent.provider_config 
        }
      });

      if (error) throw error;

      if (!data.success || !data.token) {
        throw new Error('Failed to get session token');
      }

      // Create WebRTC connection for OpenAI Realtime
      const pc = new RTCPeerConnection();
      sessionRef.current = {
        conversationId: data.conversationId,
        sessionId: data.sessionId,
        token: data.token,
        pc
      };

      // Set up remote audio
      pc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      pc.addTrack(stream.getTracks()[0]);

      // Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      sessionRef.current.dc = dc;
      
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        handleRealtimeEvent(event);
      });

      dc.addEventListener("open", () => {
        console.log("Data channel opened");
        
        // Send session update with proper configuration
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: agent.prompt_text || agent.settings?.instructions || "You are a helpful assistant.",
            voice: agent.voice || "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };
        
        dc.send(JSON.stringify(sessionUpdate));
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = agent.model || "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      
      setIsConnected(true);
      transcriptRef.current = [];
      
      toast({
        title: "Connected",
        description: `Voice session started with ${agent.name}`,
      });

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    if (!sessionRef.current) return;

    try {
      // End conversation session in database
      await supabase.functions.invoke('conversation-end', {
        body: { 
          conversationId: sessionRef.current.conversationId 
        }
      });

      // Close WebRTC connections
      sessionRef.current.dc?.close();
      sessionRef.current.pc?.close();
      sessionRef.current = null;
      
      setIsConnected(false);
      setIsMuted(false);
      onSpeakingChange?.(false);
      
      toast({
        title: "Disconnected",
        description: "Voice session ended",
      });

    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const toggleMute = () => {
    // Implementation would control microphone muting
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <Button 
            onClick={startConversation}
            disabled={isConnecting}
            className="bg-primary hover:bg-primary/90"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <Phone className="w-4 h-4 mr-2" />
            )}
            {isConnecting ? 'Connecting...' : 'Start Session'}
          </Button>
        ) : (
          <>
            <Button 
              onClick={toggleMute}
              variant="outline"
              size="sm"
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button 
              onClick={endConversation}
              variant="destructive"
              size="sm"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </>
        )}
      </div>
      
      {isConnected && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Connected to {agent.name}
        </div>
      )}
    </div>
  );
};