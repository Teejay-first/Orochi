import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { DEMO_AGENTS } from '@/data/demoAgents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentContextType {
  agents: Agent[];
  loading: boolean;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAgent: (id: string, agent: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  duplicateAgent: (id: string) => Promise<void>;
  exportAgents: () => string;
  importAgents: (json: string) => Promise<boolean>;
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
  const [loading, setLoading] = useState(true);

  // Convert database row to Agent format
  const dbToAgent = (row: any): Agent => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    tagline: row.tagline,
    category: row.category,
    language: row.language,
    prompt_source: row.prompt_source,
    prompt_text: row.prompt_text,
    prompt_id: row.prompt_id,
    prompt_version: row.prompt_version,
    prompt_variables: row.prompt_variables,
    instructions_override: row.instructions_override,
    voice: row.voice,
    model: row.model,
    status_type: row.status_type || 'deployed',
    rating: row.rating || 0, // popularity score
    average_rating: row.average_rating || 0, // 5-star average
    total_thumbs_up: row.total_thumbs_up || 0,
    total_thumbs_down: row.total_thumbs_down || 0,
    total_ratings: row.total_ratings || 0,
    agent_price: typeof row.agent_price === 'number' ? row.agent_price : undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime()
  });

  // Convert Agent to database format
  const agentToDb = (agent: Partial<Agent>) => ({
    name: agent.name,
    avatar_url: agent.avatarUrl,
    tagline: agent.tagline,
    category: agent.category,
    language: agent.language,
    prompt_source: agent.prompt_source,
    prompt_text: agent.prompt_text,
    prompt_id: agent.prompt_id,
    prompt_version: agent.prompt_version,
    prompt_variables: agent.prompt_variables,
    instructions_override: agent.instructions_override,
    voice: agent.voice,
    model: agent.model,
    status_type: agent.status_type,
    agent_price: agent.agent_price,
  });

  // Load agents from database on mount
  useEffect(() => {
    loadAgents();
  }, []);

  // Master Agent configuration
  const MASTER_AGENT: Agent = {
    id: 'master-agent-aristocratic',
    name: 'Voxie',
    avatarUrl: 'https://zapodaj.net/images/e5508e3c0c134.png',
    tagline: 'Agent Creator. Spin up a real, on-brand voice agent in minutes. Connect it to your data and tools, give it a voice, and drop it into web, phone, or chat. It listens, thinks, and speaks in real time, handles tasks end-to-end, and learns from every conversation.',
    category: 'Business',
    language: ['EN'],
    prompt_source: 'aristocratic_master_agent',
    voice: 'alloy',
    model: 'gpt-realtime-2025-08-28',
    status_type: 'deployed',
    rating: 143,
    average_rating: 5.0,
    total_thumbs_up: 100,
    total_thumbs_down: 0,
    total_ratings: 20,
    agent_price: 4,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dbAgents = data ? data.map(dbToAgent) : [];
      
      if (dbAgents.length === 0) {
        // Insert demo agents if no agents exist
        await insertDemoAgents();
      } else {
        // Always include master agent at the beginning of the list
        setAgents([MASTER_AGENT, ...dbAgents]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Failed to load agents');
      setAgents([MASTER_AGENT, ...DEMO_AGENTS]);
    } finally {
      setLoading(false);
    }
  };

  const insertDemoAgents = async () => {
    try {
      // Get current user for owner_user_id
      const { data: { user } } = await supabase.auth.getUser();
      
      const demoData = DEMO_AGENTS.map(agent => ({
        ...agentToDb(agent),
        owner_user_id: user?.id || null
      }));
      
      const { data, error } = await supabase
        .from('agents')
        .insert(demoData)
        .select();

      if (error) throw error;
      const dbAgents = data ? data.map(dbToAgent) : DEMO_AGENTS;
      // Always include master agent at the beginning
      setAgents([MASTER_AGENT, ...dbAgents]);
    } catch (error) {
      console.error('Error inserting demo agents:', error);
      setAgents([MASTER_AGENT, ...DEMO_AGENTS]);
    }
  };

  const addAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Get current user for owner_user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbData = {
        ...agentToDb(agentData),
        owner_user_id: user.id
      };

      const { data, error } = await supabase
        .from('agents')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      const newAgent = dbToAgent(data);
      setAgents(prev => [newAgent, ...prev]);
      toast.success('Agent added successfully');
    } catch (error: any) {
      console.error('Error adding agent:', error);
      const errorMsg = error?.message || 'Failed to add agent';
      toast.error(`Failed to add agent: ${errorMsg}`);
      throw error;
    }
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(agentToDb(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updatedAgent = dbToAgent(data);
      setAgents(prev => 
        prev.map(agent => 
          agent.id === id ? updatedAgent : agent
        )
      );
      toast.success('Agent updated successfully');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAgents(prev => prev.filter(agent => agent.id !== id));
      toast.success('Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const duplicateAgent = async (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (agent) {
      try {
        // Get current user for owner_user_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const duplicatedData = {
          ...agentToDb(agent),
          name: `${agent.name} (Copy)`,
          owner_user_id: user.id
        };
        
        const { data, error } = await supabase
          .from('agents')
          .insert([duplicatedData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        const duplicatedAgent = dbToAgent(data);
        setAgents(prev => [duplicatedAgent, ...prev]);
        toast.success('Agent duplicated successfully');
      } catch (error: any) {
        console.error('Error duplicating agent:', error);
        const errorMsg = error?.message || 'Failed to duplicate agent';
        toast.error(`Failed to duplicate agent: ${errorMsg}`);
      }
    }
  };

  const exportAgents = () => {
    return JSON.stringify(agents, null, 2);
  };

  const importAgents = async (json: string): Promise<boolean> => {
    try {
      const imported = JSON.parse(json) as Agent[];
      if (Array.isArray(imported) && imported.every(a => a.id && a.name)) {
        // Get current user for owner_user_id
        const { data: { user } } = await supabase.auth.getUser();
        
        // Clear existing agents and insert imported ones
        const { error: deleteError } = await supabase
          .from('agents')
          .delete()
          .neq('id', ''); // Delete all

        if (deleteError) throw deleteError;

        const importData = imported.map(agent => ({
          ...agentToDb(agent),
          owner_user_id: user?.id || null
        }));
        
        const { data, error } = await supabase
          .from('agents')
          .insert(importData)
          .select();

        if (error) throw error;
        setAgents(data ? data.map(dbToAgent) : imported);
        toast.success('Agents imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing agents:', error);
      toast.error('Failed to import agents');
      return false;
    }
  };

  return (
    <AgentContext.Provider value={{
      agents,
      loading,
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