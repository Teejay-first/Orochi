import { supabase } from '@/integrations/supabase/client';

export interface RealtimeMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  isPartial?: boolean;
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private sessionInstructions?: string;
  private sessionPromptId?: string;
  private sessionModel: string = 'gpt-realtime-2025-08-28';

  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onStatusChange: (status: 'idle' | 'connecting' | 'connected' | 'ended') => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    document.body.appendChild(this.audioEl);
  }

  async init(agentVoice: string, options?: { instructions?: string; promptId?: string; model?: string }) {
    try {
      this.onStatusChange('connecting');
      // Persist session options for later session.update
      this.sessionInstructions = options?.instructions;
      this.sessionPromptId = options?.promptId;
      if (options?.model) this.sessionModel = options.model;
      
      // Get ephemeral token from our Supabase Edge Function
      const { data: tokenData, error } = await supabase.functions.invoke("realtime-token", {
        body: {
          voice: agentVoice,
          instructions: options?.instructions
        }
      });

      if (error || !tokenData?.client_secret?.value) {
        console.error("Token error:", error);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;
      console.log("Got ephemeral token, initializing WebRTC...");

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = (e) => {
        console.log("Received remote audio track");
        if (this.audioEl) {
          this.audioEl.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.pc.addTrack(audioTrack, this.localStream);

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        this.handleRealtimeEvent(event);
      });

      this.dc.addEventListener("open", () => {
        console.log("Data channel opened");
        this.onStatusChange('connected');
        
        // Send initial message
        this.onMessage({
          id: Date.now().toString(),
          type: 'system',
          content: 'Connected! Start speaking or type a message.',
          timestamp: Date.now(),
        });
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = encodeURIComponent(this.sessionModel);
      
      console.log("Connecting to OpenAI Realtime API...");
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("SDP response error:", errorText);
        throw new Error(`SDP failed: ${sdpResponse.status} ${errorText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing chat:", error);
      this.onStatusChange('ended');
      throw error;
    }
  }

  private handleRealtimeEvent(event: any) {
    switch (event.type) {
      case 'session.created': {
        console.log('Session created event received');
        if (this.dc) {
          if (this.sessionPromptId) {
            this.dc.send(JSON.stringify({
              type: 'session.update',
              session: { prompt: { id: this.sessionPromptId } }
            }));
            console.log('Applied hosted prompt via session.update:', this.sessionPromptId);
          } else if (this.sessionInstructions) {
            this.dc.send(JSON.stringify({
              type: 'session.update',
              session: { instructions: this.sessionInstructions }
            }));
            console.log('Applied instructions via session.update');
          }
        }
        break;
      }
      case 'conversation.item.created':
        if (event.item?.content?.[0]?.text) {
          this.onMessage({
            id: event.item.id,
            type: event.item.role === 'user' ? 'user' : 'agent',
            content: event.item.content[0].text,
            timestamp: Date.now(),
          });
        }
        break;
      
      case 'response.text.delta':
        // Handle streaming text responses
        this.onMessage({
          id: event.response_id || Date.now().toString(),
          type: 'agent',
          content: event.delta || '',
          timestamp: Date.now(),
          isPartial: true,
        });
        break;

      case 'response.text.done':
        this.onMessage({
          id: event.response_id || Date.now().toString(),
          type: 'agent',
          content: event.text || '',
          timestamp: Date.now(),
        });
        break;

      case 'error':
        console.error('Realtime API error:', event);
        this.onMessage({
          id: Date.now().toString(),
          type: 'system',
          content: `Error: ${event.error?.message || 'Unknown error'}`,
          timestamp: Date.now(),
        });
        break;
    }
  }

  async sendTextMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Connection not ready');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    
    // Trigger a response
    this.dc.send(JSON.stringify({ type: 'response.create' }));

    // Add user message to chat
    this.onMessage({
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    });
  }

  disconnect() {
    console.log("Disconnecting...");
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.audioEl) {
      document.body.removeChild(this.audioEl);
      this.audioEl = null;
    }

    this.onStatusChange('ended');
  }
}