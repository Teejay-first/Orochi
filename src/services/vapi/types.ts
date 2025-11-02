// Vapi API Types
// Based on: https://docs.vapi.ai

export interface VapiAssistant {
  id: string;
  orgId: string;
  name: string;
  model?: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  voice?: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  systemPrompt?: string;
  transcriber?: {
    provider: string;
    model?: string;
    language?: string;
  };
  recordingEnabled?: boolean;
  serverUrl?: string;
  serverUrlSecret?: string;
  endCallMessage?: string;
  endCallPhrases?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VapiCall {
  id: string;
  orgId: string;
  assistantId?: string;
  assistant?: VapiAssistant;
  phoneNumberId?: string;
  phoneNumber?: string;
  customerId?: string;
  type: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall';
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: {
    total: number;
    llm?: number;
    stt?: number;
    tts?: number;
    vapi?: number;
    transport?: number;
  };
  messages?: Array<{
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    timestamp: string;
  }>;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VapiPhoneNumber {
  id: string;
  orgId: string;
  number: string;
  provider?: 'vapi' | 'twilio' | 'vonage';
  assistantId?: string;
  serverUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VapiFile {
  id: string;
  orgId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VapiTool {
  id: string;
  orgId: string;
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
  server?: {
    url: string;
    secret?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VapiSession {
  id: string;
  orgId: string;
  assistantId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface VapiListResponse<T> {
  data: T[];
  hasMore?: boolean;
  nextCursor?: string;
}

export interface VapiErrorResponse {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

// Create/Update request types
export interface CreateAssistantRequest {
  name: string;
  model?: VapiAssistant['model'];
  voice?: VapiAssistant['voice'];
  firstMessage?: string;
  systemPrompt?: string;
  transcriber?: VapiAssistant['transcriber'];
  recordingEnabled?: boolean;
  serverUrl?: string;
  serverUrlSecret?: string;
  endCallMessage?: string;
  endCallPhrases?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateAssistantRequest extends Partial<CreateAssistantRequest> {}

export interface CreateCallRequest {
  assistantId?: string;
  assistant?: CreateAssistantRequest;
  phoneNumberId?: string;
  phoneNumber?: string; // Direct phone number for outbound calls
  customerId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePhoneNumberRequest {
  provider?: 'vapi' | 'twilio' | 'vonage';
  number?: string;
  assistantId?: string;
  serverUrl?: string;
  metadata?: Record<string, unknown>;
  // Twilio-specific
  twilioAccountSid?: string;
  twilioAuthToken?: string;
}

export interface UploadFileRequest {
  file: File;
  name?: string;
  metadata?: Record<string, unknown>;
}
