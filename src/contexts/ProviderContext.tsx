// Provider Context for managing multi-provider connections (localStorage-based)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setVapiApiKey, clearVapiClient, VapiClient } from '@/services/vapi';

export type Provider = 'vapi' | 'elevenlabs' | 'orochi';

export interface ProviderConnection {
  id: string;
  provider: Provider;
  label?: string;
  apiKey: string;
  publicKey?: string; // For Vapi Web SDK (safe for client-side)
  orgId?: string;
  isActive: boolean;
  lastVerifiedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ProviderContextValue {
  connections: ProviderConnection[];
  activeConnection: ProviderConnection | null;
  loading: boolean;
  error: string | null;

  // Connection management
  addConnection: (provider: Provider, apiKey: string, label?: string, publicKey?: string) => Promise<ProviderConnection>;
  removeConnection: (id: string) => Promise<void>;
  setActiveConnection: (id: string) => Promise<void>;
  updatePublicKey: (publicKey: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  refreshConnections: () => Promise<void>;

  // Provider-specific clients
  getVapiClient: () => VapiClient | null;
  getVapiPublicKey: () => string | null;
}

const ProviderContext = createContext<ProviderContextValue | undefined>(undefined);

const STORAGE_KEY = 'voxhive_provider_connections';

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [activeConnection, setActiveConnectionState] = useState<ProviderConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // Update Vapi client when active connection changes
  useEffect(() => {
    if (activeConnection?.provider === 'vapi' && activeConnection.apiKey) {
      setVapiApiKey(activeConnection.apiKey);
    } else {
      clearVapiClient();
    }
  }, [activeConnection]);

  async function loadConnections() {
    try {
      setLoading(true);
      setError(null);

      // Load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConnections = JSON.parse(stored) as ProviderConnection[];
        setConnections(parsedConnections);

        // Set active connection (first active one, or first overall)
        const active = parsedConnections.find(c => c.isActive) || parsedConnections[0] || null;
        setActiveConnectionState(active);
      } else {
        setConnections([]);
        setActiveConnectionState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  }

  function saveToLocalStorage(newConnections: ProviderConnection[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConnections));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  async function addConnection(
    provider: Provider,
    apiKey: string,
    label?: string,
    publicKey?: string
  ): Promise<ProviderConnection> {
    try {
      setError(null);

      // Test the connection first
      if (provider === 'vapi') {
        const client = new VapiClient(apiKey);
        const { valid } = await client.validateApiKey();
        if (!valid) throw new Error('Invalid API key');
      }

      const newConnection: ProviderConnection = {
        id: crypto.randomUUID(),
        provider,
        apiKey,
        publicKey,
        label: label || `${provider} - ${new Date().toLocaleDateString()}`,
        isActive: connections.length === 0, // First connection is active by default
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedConnections = [newConnection, ...connections];
      setConnections(updatedConnections);
      saveToLocalStorage(updatedConnections);

      // If first connection, set as active
      if (connections.length === 0) {
        setActiveConnectionState(newConnection);
      }

      return newConnection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add connection';
      setError(message);
      throw new Error(message);
    }
  }

  async function removeConnection(id: string): Promise<void> {
    try {
      setError(null);

      const updatedConnections = connections.filter(c => c.id !== id);
      setConnections(updatedConnections);
      saveToLocalStorage(updatedConnections);

      // If removed active connection, set new active
      if (activeConnection?.id === id) {
        setActiveConnectionState(updatedConnections[0] || null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove connection';
      setError(message);
      throw new Error(message);
    }
  }

  async function setActiveConnection(id: string): Promise<void> {
    try {
      setError(null);

      const updatedConnections = connections.map(c => ({
        ...c,
        isActive: c.id === id,
      }));

      setConnections(updatedConnections);
      saveToLocalStorage(updatedConnections);

      // Update local state
      const newActive = updatedConnections.find(c => c.id === id) || null;
      setActiveConnectionState(newActive);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set active connection';
      setError(message);
      throw new Error(message);
    }
  }

  async function updatePublicKey(publicKey: string): Promise<void> {
    try {
      setError(null);

      if (!activeConnection) {
        throw new Error('No active connection to update');
      }

      const updatedConnections = connections.map(c =>
        c.id === activeConnection.id
          ? { ...c, publicKey, updatedAt: new Date().toISOString() }
          : c
      );

      setConnections(updatedConnections);
      saveToLocalStorage(updatedConnections);

      // Update local state
      const updatedActive = updatedConnections.find(c => c.id === activeConnection.id) || null;
      setActiveConnectionState(updatedActive);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update public key';
      setError(message);
      throw new Error(message);
    }
  }

  async function testConnection(id: string): Promise<boolean> {
    try {
      setError(null);

      const connection = connections.find(c => c.id === id);
      if (!connection) throw new Error('Connection not found');

      let valid = false;

      if (connection.provider === 'vapi') {
        const client = new VapiClient(connection.apiKey);
        const result = await client.validateApiKey();
        valid = result.valid;
      }

      // Update last_verified_at
      if (valid) {
        const updatedConnections = connections.map(c =>
          c.id === id
            ? { ...c, lastVerifiedAt: new Date().toISOString() }
            : c
        );
        setConnections(updatedConnections);
        saveToLocalStorage(updatedConnections);
      }

      return valid;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection test failed';
      setError(message);
      return false;
    }
  }

  async function refreshConnections(): Promise<void> {
    await loadConnections();
  }

  function getVapiClient(): VapiClient | null {
    if (activeConnection?.provider !== 'vapi' || !activeConnection.apiKey) {
      return null;
    }
    return new VapiClient(activeConnection.apiKey);
  }

  function getVapiPublicKey(): string | null {
    if (activeConnection?.provider !== 'vapi' || !activeConnection.publicKey) {
      return null;
    }
    return activeConnection.publicKey;
  }

  const value: ProviderContextValue = {
    connections,
    activeConnection,
    loading,
    error,
    addConnection,
    removeConnection,
    setActiveConnection,
    updatePublicKey,
    testConnection,
    refreshConnections,
    getVapiClient,
    getVapiPublicKey,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}
