import { supabase } from '@/integrations/supabase/client';

export interface RealtimeMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  isPartial?: boolean;
}

export interface ConversationTurn {
  user_text: string;
  assistant_text: string;
  input_tokens: number;
  output_tokens: number;
  cached_input_tokens: number;
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private sessionInstructions?: string;
  private sessionPromptId?: string;
  private sessionModel: string = 'gpt-realtime-2025-08-28';
  private conversationId: string | null = null;
  private currentTurn: Partial<ConversationTurn> = {};
  private userTextBuffer: string = '';
  private assistantTextBuffer: string = '';
  private turnIndex: number = 0;
  private sessionStartTime: number | null = null;
  private isMicMuted: boolean = false;
  private isSpeakerMuted: boolean = false;
  private pendingPromptConfig: any = null;
  private pendingInstructionsOverride: string | null = null;

  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onStatusChange: (status: 'idle' | 'connecting' | 'connected' | 'ended') => void,
    private agentId?: string,
    private userId?: string
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    document.body.appendChild(this.audioEl);
  }

  async init(agentVoice: string, options?: { agent?: any; instructions?: string; promptId?: string; model?: string; prompt?: any }) {
    try {
      this.onStatusChange('connecting');
      this.sessionStartTime = Date.now(); // Track session start time
      
      // Persist session options for later session.update
      const agent = options?.agent;
      this.sessionInstructions = options?.instructions;
      this.sessionPromptId = options?.promptId;
      if (options?.model) this.sessionModel = options.model;
      
      // Prepare prompt object for hosted prompts
      let promptConfig = null;
      let instructionsOverride = null;

      if (agent?.prompt_source === 'prompt_id' && agent.prompt_id) {
        promptConfig = {
          id: agent.prompt_id,
          ...(agent.prompt_version ? { version: agent.prompt_version } : {}),
          ...(agent.prompt_variables ? { variables: agent.prompt_variables } : {}),
        };
      }

      // Handle instructions override or fallback
      if (agent?.instructions_override) {
        instructionsOverride = agent.instructions_override;
      } else if (agent?.prompt_source === 'text' && agent.prompt_text) {
        instructionsOverride = agent.prompt_text;
      } else if (agent?.name || agent?.tagline) {
        instructionsOverride = `You are ${agent.name}${agent.tagline ? `, ${agent.tagline}` : ""}.`;
      }
      
      // Get ephemeral token from our Supabase Edge Function (basic config only)
      const { data: tokenData, error } = await supabase.functions.invoke("realtime-token", {
        body: {
          voice: agentVoice,
          model: this.sessionModel,
          // Only send basic instructions, hosted prompts handled via session.update
          ...(instructionsOverride ? { instructions: instructionsOverride } : {}),
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
        
        // Create conversation record
        this.createConversationRecord();
        
        // Send initial message
        this.onMessage({
          id: Date.now().toString(),
          type: 'system',
          content: 'Connected! Start speaking or type a message.',
          timestamp: Date.now(),
        });
        
        // Store prompt config for session.update after session.created
        this.pendingPromptConfig = promptConfig;
        this.pendingInstructionsOverride = instructionsOverride;
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
          // Build session update payload
          const sessionPayload: any = {
            input_audio_transcription: {
              enabled: true
            }
          };

          // Add hosted prompt configuration if available
          if (this.pendingPromptConfig) {
            sessionPayload.prompt = this.pendingPromptConfig;
            console.log('Adding hosted prompt config:', this.pendingPromptConfig);
          }

          // Add instruction override if available
          if (this.pendingInstructionsOverride) {
            sessionPayload.instructions = this.pendingInstructionsOverride;
            console.log('Adding instruction override:', this.pendingInstructionsOverride);
          }

          const sessionUpdate = {
            type: 'session.update',
            session: sessionPayload
          };
          
          this.dc.send(JSON.stringify(sessionUpdate));
          console.log('Applied session update:', sessionUpdate);
          
          // Clear pending configs
          this.pendingPromptConfig = null;
          this.pendingInstructionsOverride = null;
        }
        break;
      }
      
      case 'input_audio_transcription.delta': {
        console.log('User audio transcription delta:', event.delta);
        this.userTextBuffer += event.delta || '';
        break;
      }
      
      case 'input_audio_transcription.completed': {
        console.log('User audio transcription completed:', event.transcript);
        this.userTextBuffer = event.transcript || this.userTextBuffer;
        break;
      }
      
      case 'response.output_item.added': {
        if (event.item?.type === 'message') {
          console.log('Response output item added');
        }
        break;
      }
      
      case 'response.text.delta': {
        console.log('Assistant text delta:', event.delta);
        this.assistantTextBuffer += event.delta || '';
        this.onMessage({
          id: event.response_id || Date.now().toString(),
          type: 'agent',
          content: event.delta || '',
          timestamp: Date.now(),
          isPartial: true,
        });
        break;
      }
      
      case 'response.done': {
        console.log('Response completed:', event);
        this.handleResponseCompleted(event);
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

  private async createConversationRecord() {
    if (!this.userId || !this.agentId) {
      console.warn('Missing userId or agentId for conversation record');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert({
          user_id: this.userId,
          agent_id: this.agentId,
          model: this.sessionModel,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      this.conversationId = data.id;
      console.log('Created conversation record:', data.id);
    } catch (error) {
      console.error('Failed to create conversation record:', error);
    }
  }

  private async handleResponseCompleted(event: any) {
    console.log('Processing completed response with usage:', event.response?.usage);
    
    const usage = event.response?.usage;
    
    // Save the current turn if we have text or usage info
    if (this.userTextBuffer.trim() || this.assistantTextBuffer.trim() || usage) {
      await this.saveTurn(usage);
    }

    // Update conversation totals
    await this.updateConversationStats(usage);
    
    // Reset buffers for next turn
    this.userTextBuffer = '';
    this.assistantTextBuffer = '';
  }

  private async saveTurn(usage?: any) {
    if (!this.conversationId) {
      console.warn('No conversation ID for turn saving');
      return;
    }

    try {
      const { error } = await supabase
        .from('conversation_turns')
        .insert({
          conversation_id: this.conversationId,
          turn_index: this.turnIndex++,
          user_text: this.userTextBuffer.trim(),
          assistant_text: this.assistantTextBuffer.trim(),
          input_tokens: usage?.input_tokens || 0,
          output_tokens: usage?.output_tokens || 0,
          cached_input_tokens: usage?.input_token_details?.cached_tokens || 0
        });

      if (error) throw error;
      
      console.log('Saved turn:', this.turnIndex - 1, 'with usage:', usage);
      
      // Reset current turn
      this.currentTurn = {};
    } catch (error) {
      console.error('Failed to save turn:', error);
    }
  }

  private async updateConversationStats(usage?: any) {
    if (!this.conversationId || !usage) return;

    try {
      const { error } = await supabase
        .from('conversation_sessions')
        .update({
          turns: this.turnIndex,
          input_tokens: usage.input_tokens || 0,
          output_tokens: usage.output_tokens || 0,
          cached_input_tokens: usage.input_token_details?.cached_tokens || 0,
          total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0)
        })
        .eq('id', this.conversationId);

      if (error) throw error;
      
      console.log('Updated conversation stats');
    } catch (error) {
      console.error('Failed to update conversation stats:', error);
    }
  }

  setMicMute(muted: boolean) {
    this.isMicMuted = muted;
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
        console.log('Microphone', muted ? 'muted' : 'unmuted');
      }
    }
  }

  setSpeakerMute(muted: boolean) {
    this.isSpeakerMuted = muted;
    if (this.audioEl) {
      this.audioEl.muted = muted;
      console.log('Speaker', muted ? 'muted' : 'unmuted');
    }
  }

  getMicMuteState(): boolean {
    return this.isMicMuted;
  }

  getSpeakerMuteState(): boolean {
    return this.isSpeakerMuted;
  }

  async disconnect() {
    console.log("Disconnecting...");
    
    // Calculate actual duration
    const actualDuration = this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;
    console.log('Session duration:', actualDuration, 'ms');
    
    // Save final conversation state
    if (this.conversationId) {
      await supabase
        .from('conversation_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_ms: actualDuration
        })
        .eq('id', this.conversationId);
      
      console.log('Updated conversation with final duration:', actualDuration);
    }
    
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