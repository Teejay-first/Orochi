// Sync Engine - Track and manage local vs remote changes
import { createHash } from 'crypto';
import { VapiAssistant } from '@/services/vapi';
import { supabase } from '@/integrations/supabase/client';

export interface SyncStatus {
  status: 'synced' | 'unsynced' | 'syncing' | 'error';
  lastSyncedAt?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  error?: string;
}

// Generate hash of assistant data for change detection
export function generateAssistantHash(assistant: Partial<VapiAssistant>): string {
  const relevantFields = {
    name: assistant.name,
    model: assistant.model,
    voice: assistant.voice,
    firstMessage: assistant.firstMessage,
    systemPrompt: assistant.systemPrompt,
    transcriber: assistant.transcriber,
    recordingEnabled: assistant.recordingEnabled,
    serverUrl: assistant.serverUrl,
    endCallMessage: assistant.endCallMessage,
    endCallPhrases: assistant.endCallPhrases,
  };

  const str = JSON.stringify(relevantFields, Object.keys(relevantFields).sort());

  // Browser-compatible hash using SubtleCrypto would be async,
  // so we'll use a simple string hash for now
  return simpleHash(str);
}

// Simple hash function for browser
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Compare local and remote assistant data
export function detectChanges(
  local: Partial<VapiAssistant>,
  remote: VapiAssistant
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const fieldsToCompare: (keyof VapiAssistant)[] = [
    'name',
    'firstMessage',
    'systemPrompt',
    'recordingEnabled',
    'serverUrl',
    'endCallMessage',
  ];

  for (const field of fieldsToCompare) {
    const localValue = local[field];
    const remoteValue = remote[field];

    if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
      changes[field] = {
        old: remoteValue,
        new: localValue,
      };
    }
  }

  // Compare nested objects
  if (JSON.stringify(local.model) !== JSON.stringify(remote.model)) {
    changes['model'] = {
      old: remote.model,
      new: local.model,
    };
  }

  if (JSON.stringify(local.voice) !== JSON.stringify(remote.voice)) {
    changes['voice'] = {
      old: remote.voice,
      new: local.voice,
    };
  }

  if (JSON.stringify(local.transcriber) !== JSON.stringify(remote.transcriber)) {
    changes['transcriber'] = {
      old: remote.transcriber,
      new: local.transcriber,
    };
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

// Mark agent as having local changes
export async function markAsUnsynced(
  agentId: string,
  changes: Record<string, { old: unknown; new: unknown }>
): Promise<void> {
  await supabase
    .from('agents')
    .update({
      sync_status: 'unsynced',
      local_changes: changes,
    })
    .eq('id', agentId);
}

// Mark agent as synced
export async function markAsSynced(
  agentId: string,
  hash: string
): Promise<void> {
  await supabase
    .from('agents')
    .update({
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      last_synced_hash: hash,
      local_changes: {},
      sync_error: null,
    })
    .eq('id', agentId);
}

// Mark agent as syncing
export async function markAsSyncing(agentId: string): Promise<void> {
  await supabase
    .from('agents')
    .update({ sync_status: 'syncing' })
    .eq('id', agentId);
}

// Mark agent sync as failed
export async function markSyncError(
  agentId: string,
  error: string
): Promise<void> {
  await supabase
    .from('agents')
    .update({
      sync_status: 'error',
      sync_error: error,
    })
    .eq('id', agentId);
}

// Convert Vapi assistant to our DB format
export function vapiToDbAssistant(vapi: VapiAssistant, providerConnectionId: string) {
  return {
    name: vapi.name,
    provider: 'vapi',
    provider_connection_id: providerConnectionId,
    provider_assistant_id: vapi.id,
    model: vapi.model?.model || 'gpt-4o',
    voice: vapi.voice?.voiceId || 'alloy',
    prompt_source: 'text',
    prompt_text: vapi.systemPrompt || '',
    settings: {
      firstMessage: vapi.firstMessage,
      endCallMessage: vapi.endCallMessage,
      endCallPhrases: vapi.endCallPhrases,
      recordingEnabled: vapi.recordingEnabled,
      serverUrl: vapi.serverUrl,
    },
    provider_config: {
      model: vapi.model,
      voice: vapi.voice,
      transcriber: vapi.transcriber,
    },
    sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    last_synced_hash: generateAssistantHash(vapi),
  };
}

// Convert our DB format to Vapi update request
export function dbToVapiAssistant(agent: any) {
  const settings = agent.settings || {};
  const providerConfig = agent.provider_config || {};

  return {
    name: agent.name,
    model: providerConfig.model || {
      provider: 'openai',
      model: agent.model || 'gpt-4o',
    },
    voice: providerConfig.voice || {
      provider: 'openai',
      voiceId: agent.voice || 'alloy',
    },
    systemPrompt: agent.prompt_text,
    firstMessage: settings.firstMessage,
    transcriber: providerConfig.transcriber,
    recordingEnabled: settings.recordingEnabled,
    serverUrl: settings.serverUrl,
    serverUrlSecret: settings.serverUrlSecret,
    endCallMessage: settings.endCallMessage,
    endCallPhrases: settings.endCallPhrases,
  };
}
