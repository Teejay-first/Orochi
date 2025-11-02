// Stub API for analytics - dashboard-only mode

export interface RecentCall {
  id: string;
  agent_name: string;
  started_at: string;
  duration_ms: number;
  tokens_used: number;
  cost: number;
  status: 'active' | 'completed' | 'failed';
}

export interface AnalyticsSummary {
  active_calls: number;
  total_calls_today: number;
  cost_today: number;
  total_tokens_today: number;
  recent_calls: RecentCall[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // Return mock data for dashboard-only mode
  return {
    active_calls: 0,
    total_calls_today: 0,
    cost_today: 0,
    total_tokens_today: 0,
    recent_calls: [],
  };
}

export async function startCall(agentId: string): Promise<{
  room_token: string;
  room_name: string;
  session_id: string;
  server_url: string;
}> {
  throw new Error('Call functionality is disabled in dashboard-only mode');
}

export async function endCall(sessionId: string): Promise<void> {
  throw new Error('Call functionality is disabled in dashboard-only mode');
}
