// Vapi Workflow Types
// Documentation: https://docs.vapi.ai/workflows

export type WorkflowNodeType =
  | 'conversation'
  | 'apiRequest'
  | 'extractVariables'
  | 'transfer'
  | 'condition'
  | 'endCall'
  | 'tool'
  | 'global';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name?: string;
  description?: string;

  // For Conversation nodes
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
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
  transcriber?: {
    provider: string;
    model?: string;
    language?: string;
  };

  // For API Request nodes
  apiRequest?: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    responseMapping?: Record<string, string>;
  };

  // For Extract Variables nodes
  extractVariables?: {
    variableName: string;
    prompt?: string;
    type?: 'string' | 'number' | 'boolean' | 'object';
  }[];

  // For Transfer nodes
  transfer?: {
    destination: string; // Phone number or transfer target
    transferPlan?: {
      message?: string;
      mode?: 'warm' | 'cold';
    };
  };

  // For Tool nodes
  toolId?: string;

  // For Global nodes
  isGlobal?: boolean;
  enterCondition?: string;

  // Position for canvas rendering (not sent to Vapi API)
  position?: {
    x: number;
    y: number;
  };
}

export type EdgeConditionType = 'ai' | 'logic';

export interface WorkflowEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  conditionType?: EdgeConditionType;

  // For AI-powered routing
  aiCondition?: {
    prompt: string;
    intent?: string;
  };

  // For logic-based routing
  logicCondition?: {
    expression: string;
    variable?: string;
    operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
    value?: string | number | boolean;
  };

  label?: string;
}

export interface VapiWorkflow {
  id: string;
  orgId: string;
  name: string;
  description?: string;

  // Nodes and edges
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // Start node
  startNodeId: string;

  // Global model configuration (can be overridden per node)
  model?: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    messages?: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
  };

  // Global voice configuration (can be overridden per node)
  voice?: {
    provider: string;
    voiceId: string;
  };

  // Global transcriber configuration (can be overridden per node)
  transcriber?: {
    provider: string;
    model?: string;
    language?: string;
  };

  // Observability
  recordingEnabled?: boolean;
  serverUrl?: string;

  // Metadata
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes: Omit<WorkflowNode, 'id' | 'position'>[];
  edges: Omit<WorkflowEdge, 'id'>[];
  startNodeId?: string;
  model?: VapiWorkflow['model'];
  voice?: VapiWorkflow['voice'];
  transcriber?: VapiWorkflow['transcriber'];
  recordingEnabled?: boolean;
  serverUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: Omit<WorkflowNode, 'id' | 'position'>[];
  edges?: Omit<WorkflowEdge, 'id'>[];
  startNodeId?: string;
  model?: VapiWorkflow['model'];
  voice?: VapiWorkflow['voice'];
  transcriber?: VapiWorkflow['transcriber'];
  recordingEnabled?: boolean;
  serverUrl?: string;
  metadata?: Record<string, unknown>;
}

// Node templates for the palette
export const WorkflowNodeTemplates: Record<WorkflowNodeType, Partial<WorkflowNode>> = {
  conversation: {
    type: 'conversation',
    name: 'Conversation',
    description: 'Main building block for conversation flows',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
    ],
  },
  apiRequest: {
    type: 'apiRequest',
    name: 'API Request',
    description: 'Make HTTP requests to external services',
    apiRequest: {
      method: 'POST',
      url: 'https://api.example.com/endpoint',
      headers: {},
      body: {},
    },
  },
  extractVariables: {
    type: 'extractVariables',
    name: 'Extract Variables',
    description: 'Extract and store variables from conversation',
    extractVariables: [
      {
        variableName: 'example_variable',
        type: 'string',
      },
    ],
  },
  transfer: {
    type: 'transfer',
    name: 'Transfer Call',
    description: 'Transfer to phone number or agent',
    transfer: {
      destination: '+1234567890',
      transferPlan: {
        mode: 'warm',
      },
    },
  },
  condition: {
    type: 'condition',
    name: 'Condition',
    description: 'Branch based on conditions',
  },
  endCall: {
    type: 'endCall',
    name: 'End Call',
    description: 'Terminate the conversation',
  },
  tool: {
    type: 'tool',
    name: 'Tool',
    description: 'Use a tool from your library',
  },
  global: {
    type: 'global',
    name: 'Global Node',
    description: 'Accessible from anywhere in workflow',
    isGlobal: true,
  },
};
