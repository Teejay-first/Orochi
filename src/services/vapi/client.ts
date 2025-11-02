// Vapi API Client
// Base URL: https://api.vapi.ai
// Documentation: https://docs.vapi.ai

import {
  VapiAssistant,
  VapiCall,
  VapiPhoneNumber,
  VapiFile,
  VapiTool,
  VapiSession,
  VapiListResponse,
  VapiErrorResponse,
  CreateAssistantRequest,
  UpdateAssistantRequest,
  CreateCallRequest,
  CreatePhoneNumberRequest,
  UploadFileRequest,
} from './types';
import {
  VapiWorkflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from './workflow-types';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export class VapiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: string
  ) {
    super(message);
    this.name = 'VapiError';
  }
}

export class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = VAPI_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Getter for API key (needed for Vapi Web SDK)
  getApiKey(): string {
    return this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: VapiErrorResponse | undefined;
        try {
          errorData = await response.json();
        } catch {
          // If JSON parsing fails, use status text
        }

        const message = errorData?.error?.message || response.statusText;
        const code = errorData?.error?.code;
        const type = errorData?.error?.type;

        throw new VapiError(message, code, type);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof VapiError) {
        throw error;
      }
      throw new VapiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  // ========== Assistants ==========

  async listAssistants(): Promise<VapiAssistant[]> {
    const response = await this.request<VapiListResponse<VapiAssistant>>(
      '/assistant'
    );
    return response.data || response as unknown as VapiAssistant[];
  }

  async getAssistant(id: string): Promise<VapiAssistant> {
    return this.request<VapiAssistant>(`/assistant/${id}`);
  }

  async createAssistant(data: CreateAssistantRequest): Promise<VapiAssistant> {
    return this.request<VapiAssistant>('/assistant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssistant(
    id: string,
    data: UpdateAssistantRequest
  ): Promise<VapiAssistant> {
    return this.request<VapiAssistant>(`/assistant/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAssistant(id: string): Promise<void> {
    return this.request<void>(`/assistant/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Calls ==========

  async listCalls(): Promise<VapiCall[]> {
    const response = await this.request<VapiListResponse<VapiCall>>('/call');
    return response.data || response as unknown as VapiCall[];
  }

  async getCall(id: string): Promise<VapiCall> {
    return this.request<VapiCall>(`/call/${id}`);
  }

  async createCall(data: CreateCallRequest): Promise<VapiCall> {
    return this.request<VapiCall>('/call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCall(id: string): Promise<void> {
    return this.request<void>(`/call/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Phone Numbers ==========

  async listPhoneNumbers(): Promise<VapiPhoneNumber[]> {
    const response = await this.request<VapiListResponse<VapiPhoneNumber>>(
      '/phone-number'
    );
    return response.data || response as unknown as VapiPhoneNumber[];
  }

  async getPhoneNumber(id: string): Promise<VapiPhoneNumber> {
    return this.request<VapiPhoneNumber>(`/phone-number/${id}`);
  }

  async createPhoneNumber(
    data: CreatePhoneNumberRequest
  ): Promise<VapiPhoneNumber> {
    return this.request<VapiPhoneNumber>('/phone-number', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePhoneNumber(
    id: string,
    data: Partial<CreatePhoneNumberRequest>
  ): Promise<VapiPhoneNumber> {
    return this.request<VapiPhoneNumber>(`/phone-number/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePhoneNumber(id: string): Promise<void> {
    return this.request<void>(`/phone-number/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Files ==========

  async listFiles(): Promise<VapiFile[]> {
    const response = await this.request<VapiListResponse<VapiFile>>('/file');
    return response.data || response as unknown as VapiFile[];
  }

  async getFile(id: string): Promise<VapiFile> {
    return this.request<VapiFile>(`/file/${id}`);
  }

  async uploadFile(data: UploadFileRequest): Promise<VapiFile> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.name) formData.append('name', data.name);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const url = `${this.baseUrl}/file`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: VapiErrorResponse = await response.json();
      throw new VapiError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.type
      );
    }

    return response.json();
  }

  async deleteFile(id: string): Promise<void> {
    return this.request<void>(`/file/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Tools ==========

  async listTools(): Promise<VapiTool[]> {
    const response = await this.request<VapiListResponse<VapiTool>>('/tool');
    return response.data || response as unknown as VapiTool[];
  }

  async getTool(id: string): Promise<VapiTool> {
    return this.request<VapiTool>(`/tool/${id}`);
  }

  async createTool(data: {
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
  }): Promise<VapiTool> {
    return this.request<VapiTool>('/tool', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTool(
    id: string,
    data: {
      function?: {
        name?: string;
        description?: string;
        parameters?: Record<string, unknown>;
      };
      server?: {
        url?: string;
        secret?: string;
      };
      metadata?: Record<string, unknown>;
    }
  ): Promise<VapiTool> {
    return this.request<VapiTool>(`/tool/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTool(id: string): Promise<void> {
    return this.request<void>(`/tool/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Knowledge Bases ==========

  async listKnowledgeBases(): Promise<any[]> {
    const response = await this.request<VapiListResponse<any>>('/knowledge-base');
    return response.data || response as unknown as any[];
  }

  async getKnowledgeBase(id: string): Promise<any> {
    return this.request<any>(`/knowledge-base/${id}`);
  }

  async createKnowledgeBase(data: {
    name: string;
    provider?: string;
    fileIds?: string[];
  }): Promise<any> {
    return this.request<any>('/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    return this.request<void>(`/knowledge-base/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Sessions ==========

  async listSessions(): Promise<VapiSession[]> {
    const response = await this.request<VapiListResponse<VapiSession>>(
      '/session'
    );
    return response.data || response as unknown as VapiSession[];
  }

  async getSession(id: string): Promise<VapiSession> {
    return this.request<VapiSession>(`/session/${id}`);
  }

  async createSession(data: {
    assistantId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<VapiSession> {
    return this.request<VapiSession>('/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.request<void>(`/session/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Workflows ==========

  async listWorkflows(): Promise<VapiWorkflow[]> {
    const response = await this.request<VapiListResponse<VapiWorkflow>>('/workflow');
    return response.data || response as unknown as VapiWorkflow[];
  }

  async getWorkflow(id: string): Promise<VapiWorkflow> {
    return this.request<VapiWorkflow>(`/workflow/${id}`);
  }

  async createWorkflow(data: CreateWorkflowRequest): Promise<VapiWorkflow> {
    return this.request<VapiWorkflow>('/workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(
    id: string,
    data: UpdateWorkflowRequest
  ): Promise<VapiWorkflow> {
    return this.request<VapiWorkflow>(`/workflow/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request<void>(`/workflow/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Health Check ==========

  async validateApiKey(): Promise<{ valid: boolean; orgId?: string }> {
    try {
      // Try to list assistants as a health check
      await this.listAssistants();
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  }
}

// Singleton instance management
let vapiClientInstance: VapiClient | null = null;

export function setVapiApiKey(apiKey: string): void {
  vapiClientInstance = new VapiClient(apiKey);
}

export function getVapiClient(): VapiClient {
  if (!vapiClientInstance) {
    throw new Error('Vapi API key not configured. Call setVapiApiKey() first.');
  }
  return vapiClientInstance;
}

export function clearVapiClient(): void {
  vapiClientInstance = null;
}
