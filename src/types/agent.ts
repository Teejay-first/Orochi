export interface Agent {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  category: string;
  language: string;
  prompt_source: 'text' | 'prompt_id';
  prompt_text?: string;
  prompt_id?: string;
  voice: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface VoiceSession {
  id: string;
  agentId: string;
  status: 'idle' | 'connecting' | 'connected' | 'ended';
  startTime?: number;
  endTime?: number;
  messages: SessionMessage[];
}

export interface SessionMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  isPartial?: boolean;
}

export const CATEGORIES = [
  'Shopping',
  'Support',
  'Fitness',
  'Compliance',
  'Education',
  'Sales',
  'Entertainment',
  'Business',
  'Health',
  'Other'
] as const;

export const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'PL', name: 'Polish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'NL', name: 'Dutch' },
  { code: 'SV', name: 'Swedish' },
  { code: 'NO', name: 'Norwegian' }
] as const;

export const VOICES = [
  'alloy',
  'echo', 
  'fable',
  'onyx',
  'nova',
  'shimmer'
] as const;