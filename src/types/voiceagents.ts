export type ProviderKey = 'openai_realtime' | 'livekit' | 'vapi' | 'elevenlabs';

export interface NormalizedUsage {
  input_tokens?: number;
  output_tokens?: number;
  cached_input_tokens?: number;
}

export type NormalizedEvent =
  | { type: 'user.text.delta'; text: string }
  | { type: 'assistant.text.delta'; text: string }
  | { type: 'turn.completed'; usage: NormalizedUsage; meta?: any }
  | { type: 'session.started' }
  | { type: 'session.ended' }
  | { type: 'error'; message: string };

export interface VoiceAgentAdapter {
  id: ProviderKey;
  displayName: string;
  createClientToken(args: { userId: string; agent: any }): Promise<{ 
    token: string; 
    expiresAt?: number; 
    extra?: any 
  }>;
  start(opts: { 
    agentId: string; 
    userId: string; 
    providerConfig: any; 
    onEvent: (ev: NormalizedEvent) => void 
  }): Promise<{ 
    end: () => Promise<void> 
  }>;
  capabilities: { 
    transcripts: boolean; 
    usage: boolean; 
    embed?: boolean; 
    webrtc?: boolean; 
    websocket?: boolean 
  };
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  short_desc?: string;
  category?: string;
  tags?: string[];
  model: string;
  voice: string;
  provider: ProviderKey;
  provider_config: any;
  settings: any;
  prompt_text?: string; // Add this field
  prompt_id?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'suspended';
  visibility: 'listed' | 'unlisted';
  access_mode: 'open' | 'request' | 'private';
  is_featured: boolean;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationSession {
  id: string;
  user_id?: string;
  agent_id?: string;
  session_id?: string;
  transport?: string;
  model?: string;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  turns: number;
  input_tokens: number;
  output_tokens: number;
  cached_input_tokens: number;
  total_tokens: number;
  metadata: any;
  status?: string;
  transcript?: any[];
}

export interface ConversationTurn {
  id: string;
  conversation_id: string;
  turn_index: number;
  started_at?: string;
  completed_at?: string;
  user_text?: string;
  assistant_text?: string;
  input_tokens: number;
  output_tokens: number;
  cached_input_tokens: number;
  raw_usage?: any;
  raw_meta?: any;
}