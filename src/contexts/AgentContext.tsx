import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { DEMO_AGENTS } from '@/data/demoAgents';

interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  duplicateAgent: (id: string) => void;
  exportAgents: () => string;
  importAgents: (json: string) => boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  // Load agents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('voicetube-agents');
    if (stored) {
      try {
        setAgents(JSON.parse(stored));
      } catch {
        setAgents(DEMO_AGENTS);
      }
    } else {
      setAgents(DEMO_AGENTS);
    }
  }, []);

  // Save to localStorage whenever agents change
  useEffect(() => {
    localStorage.setItem('voicetube-agents', JSON.stringify(agents));
  }, [agents]);

  const addAgent = (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAgents(prev => [...prev, newAgent]);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === id 
          ? { ...agent, ...updates, updatedAt: Date.now() }
          : agent
      )
    );
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
  };

  const duplicateAgent = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (agent) {
      const duplicated: Agent = {
        ...agent,
        id: crypto.randomUUID(),
        name: `${agent.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setAgents(prev => [...prev, duplicated]);
    }
  };

  const exportAgents = () => {
    return JSON.stringify(agents, null, 2);
  };

  const importAgents = (json: string) => {
    try {
      const imported = JSON.parse(json) as Agent[];
      if (Array.isArray(imported) && imported.every(a => a.id && a.name)) {
        setAgents(imported);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AgentContext.Provider value={{
      agents,
      addAgent,
      updateAgent,
      deleteAgent,
      duplicateAgent,
      exportAgents,
      importAgents,
    }}>
      {children}
    </AgentContext.Provider>
  );
};