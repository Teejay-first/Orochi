import { useState, useEffect } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { Agent } from "@/types/agent";
import { ChevronLeft, Play, Save, Settings, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AgentFlowChart } from "@/components/dashboard/AgentFlowChart";

interface AgentConfigurationProps {
  agentId: string | null;
  onBack: () => void;
}

export function AgentConfiguration({ agentId, onBack }: AgentConfigurationProps) {
  const { agents, updateAgent } = useAgents();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    if (agentId) {
      const foundAgent = agents.find(a => a.id === agentId);
      if (foundAgent) {
        setAgent(foundAgent);
        setPrompt(foundAgent.prompt_text || foundAgent.prompt_source);
        setSelectedVoice(foundAgent.voice);
      }
    }
  }, [agentId, agents]);

  const handleSave = async () => {
    if (!agent) return;
    
    try {
      await updateAgent(agent.id, {
        prompt_text: prompt,
        voice: selectedVoice,
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={agent.avatarUrl} alt={agent.name} />
              <AvatarFallback>
                {agent.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Agent ID: {agent.id.substring(0, 8)}...</span>
                <Badge variant="secondary">Conversation Flow</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Test Agent
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Chart - Left side (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <AgentFlowChart agent={agent} />
        </div>

        {/* Configuration Panel - Right side (1/3 width on large screens) */}
        <div className="space-y-4">
          {/* Agent Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Agent Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice & Language */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Voice & Language</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Multilingual</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {selectedVoice.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alloy">Alloy</SelectItem>
                      <SelectItem value="echo">Echo</SelectItem>
                      <SelectItem value="fable">Fable</SelectItem>
                      <SelectItem value="onyx">Onyx</SelectItem>
                      <SelectItem value="nova">Nova</SelectItem>
                      <SelectItem value="shimmer">Shimmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Global Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Global Prompt</Label>
                <Badge variant="outline" className="mb-2">GPT 4.1</Badge>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Customer Service & Support Agent Prompt</h4>
                  <h5 className="font-medium text-sm">Identity & Purpose</h5>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter agent prompt..."
                    className="min-h-[200px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Knowledge Base
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No knowledge base configured
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}