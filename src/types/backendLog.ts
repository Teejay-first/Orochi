export interface BackendLogEvent {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stage?: AgentCreationStage;
  metadata?: Record<string, any>;
}

export type AgentCreationStage =
  | 'initializing'
  | 'loading_model'
  | 'connecting_services'
  | 'configuring_agent'
  | 'starting_livekit'
  | 'agent_ready'
  | 'agent_connected'
  | 'error';

export interface BackendLogState {
  currentStage: AgentCreationStage | null;
  logs: BackendLogEvent[];
  isConnected: boolean;
  error: string | null;
}
