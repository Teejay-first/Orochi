export interface Agent {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  category: string;
  language: string[];
  prompt_source: 'text' | 'prompt_id';
  prompt_text?: string;
  prompt_id?: string;
  voice: string;
  model: string;
  status_type: 'deployed' | 'testing' | 'building' | 'repairing';
  agent_price?: number; // 1-4 representing $, $$, $$$, $$$$
  rating?: number; // This is now the popularity score (thumbs up - thumbs down)
  average_rating?: number; // This is the new 5-star average rating
  total_thumbs_up?: number;
  total_thumbs_down?: number;
  total_ratings?: number;
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
  'ash',
  'ballad',
  'coral',
  'echo',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar'
] as const;

export const STATUS_TYPES = [
  { value: 'deployed', label: 'Running', color: 'status-deployed' },
  { value: 'testing', label: 'Testing', color: 'status-testing' },
  { value: 'building', label: 'Building', color: 'status-building' },
  { value: 'repairing', label: 'Repairing', color: 'status-repairing' }
] as const;

export const PRICE_TYPES = [
  { value: 1, label: '$', symbol: '$' },
  { value: 2, label: '$$', symbol: '$$' },
  { value: 3, label: '$$$', symbol: '$$$' },
  { value: 4, label: '$$$$', symbol: '$$$$' }
] as const;
