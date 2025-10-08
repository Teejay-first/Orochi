import { BackendLogEvent, BackendLogState, AgentCreationStage } from '@/types/backendLog';

const BACKEND_URL = 'http://0.0.0.0:8000';
const LOG_ENDPOINT = '/logs'; // Adjust based on your backend endpoint
const POLLING_INTERVAL = 1000; // Poll every 1 second

export class BackendLogService {
  private listeners: Set<(state: BackendLogState) => void> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;
  private state: BackendLogState = {
    currentStage: null,
    logs: [],
    isConnected: false,
    error: null,
  };
  private lastLogIndex = 0;
  private useSSE = false; // Set to true if backend supports Server-Sent Events

  /**
   * Start listening to backend logs
   */
  start() {
    if (this.useSSE) {
      this.startSSE();
    } else {
      this.startPolling();
    }
  }

  /**
   * Stop listening to backend logs
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.updateState({
      isConnected: false,
      currentStage: null,
    });
  }

  /**
   * Subscribe to log state changes
   */
  subscribe(callback: (state: BackendLogState) => void) {
    this.listeners.add(callback);
    // Immediately send current state
    callback(this.state);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Start polling for logs
   */
  private startPolling() {
    this.updateState({ isConnected: true, error: null });

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${LOG_ENDPOINT}?since=${this.lastLogIndex}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.processLogData(data);
      } catch (error) {
        console.error('Error polling backend logs:', error);
        this.updateState({
          error: error instanceof Error ? error.message : 'Unknown error',
          isConnected: false,
        });
      }
    }, POLLING_INTERVAL);
  }

  /**
   * Start Server-Sent Events connection (if backend supports it)
   */
  private startSSE() {
    try {
      const eventSource = new EventSource(`${BACKEND_URL}${LOG_ENDPOINT}/stream`);

      eventSource.onopen = () => {
        this.updateState({ isConnected: true, error: null });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.processLogData(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.updateState({
          error: 'Connection to backend lost',
          isConnected: false,
        });
        eventSource.close();
      };
    } catch (error) {
      console.error('Error starting SSE:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Unknown error',
        isConnected: false,
      });
    }
  }

  /**
   * Process incoming log data
   */
  private processLogData(data: any) {
    if (!data) return;

    // Handle array of logs or single log
    const logs: BackendLogEvent[] = Array.isArray(data.logs) ? data.logs : data.log ? [data.log] : [];

    if (logs.length === 0) return;

    // Update last log index
    if (data.lastIndex !== undefined) {
      this.lastLogIndex = data.lastIndex;
    }

    // Extract current stage from the latest log
    const latestLog = logs[logs.length - 1];
    const currentStage = this.extractStage(latestLog);

    this.updateState({
      logs: [...this.state.logs, ...logs],
      currentStage: currentStage || this.state.currentStage,
    });
  }

  /**
   * Extract agent creation stage from log message
   */
  private extractStage(log: BackendLogEvent): AgentCreationStage | null {
    // If stage is explicitly provided
    if (log.stage) {
      return log.stage;
    }

    // Otherwise, infer from message
    const message = log.message.toLowerCase();

    if (message.includes('initializing') || message.includes('starting')) {
      return 'initializing';
    }
    if (message.includes('loading model') || message.includes('model loaded')) {
      return 'loading_model';
    }
    if (message.includes('connecting') || message.includes('connection')) {
      return 'connecting_services';
    }
    if (message.includes('configuring agent') || message.includes('agent config')) {
      return 'configuring_agent';
    }
    if (message.includes('starting livekit') || message.includes('livekit started')) {
      return 'starting_livekit';
    }
    if (message.includes('agent ready') || message.includes('ready to connect')) {
      return 'agent_ready';
    }
    if (message.includes('agent connected') || message.includes('connection established')) {
      return 'agent_connected';
    }
    if (message.includes('error') || log.level === 'error') {
      return 'error';
    }

    return null;
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<BackendLogState>) {
    this.state = {
      ...this.state,
      ...updates,
    };

    this.listeners.forEach((listener) => {
      listener(this.state);
    });
  }

  /**
   * Get current state
   */
  getState(): BackendLogState {
    return { ...this.state };
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.updateState({
      logs: [],
      currentStage: null,
    });
    this.lastLogIndex = 0;
  }
}

// Export singleton instance
export const backendLogService = new BackendLogService();
