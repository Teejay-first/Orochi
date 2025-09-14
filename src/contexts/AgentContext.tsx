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
    voice: row.voice,
    model: row.model,
    status_type: row.status_type || 'deployed',
    rating: row.rating || 0, // popularity score
    average_rating: row.average_rating || 0, // 5-star average
    total_thumbs_up: row.total_thumbs_up || 0,
    total_thumbs_down: row.total_thumbs_down || 0,
    total_ratings: row.total_ratings || 0,
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
    voice: agent.voice,
    model: agent.model,
    status_type: agent.status_type
  });

  // Load agents from database on mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Insert demo agents if no agents exist
        await insertDemoAgents();
      } else {
        setAgents(data.map(dbToAgent));
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Failed to load agents');
      setAgents(DEMO_AGENTS);
    } finally {
      setLoading(false);
    }
  };

  const insertDemoAgents = async () => {
    try {
      const demoData = DEMO_AGENTS.map(agentToDb);
      const { data, error } = await supabase
        .from('agents')
        .insert(demoData)
        .select();

      if (error) throw error;
      setAgents(data ? data.map(dbToAgent) : DEMO_AGENTS);
    } catch (error) {
      console.error('Error inserting demo agents:', error);
      setAgents(DEMO_AGENTS);
    }
  };

  const addAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([agentToDb(agentData)])
        .select()
        .single();

      if (error) throw error;
      const newAgent = dbToAgent(data);
      setAgents(prev => [newAgent, ...prev]);
      toast.success('Agent added successfully');
    } catch (error) {
      console.error('Error adding agent:', error);
      toast.error('Failed to add agent');
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
        const duplicatedData = {
          ...agentToDb(agent),
          name: `${agent.name} (Copy)`
        };
        
        const { data, error } = await supabase
          .from('agents')
          .insert([duplicatedData])
          .select()
          .single();

        if (error) throw error;
        const duplicatedAgent = dbToAgent(data);
        setAgents(prev => [duplicatedAgent, ...prev]);
        toast.success('Agent duplicated successfully');
      } catch (error) {
        console.error('Error duplicating agent:', error);
        toast.error('Failed to duplicate agent');
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
        // Clear existing agents and insert imported ones
        const { error: deleteError } = await supabase
          .from('agents')
          .delete()
          .neq('id', ''); // Delete all

        if (deleteError) throw deleteError;

        const importData = imported.map(agentToDb);
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