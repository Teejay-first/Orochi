import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent, CATEGORIES, LANGUAGES, VOICES, STATUS_TYPES } from '@/types/agent';
import { useAgents } from '@/contexts/AgentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Copy, Trash2, Download, Upload, Home, TestTube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ConversationsRegistry } from '@/components/ConversationsRegistry';
import { useAuth } from '@/hooks/useAuth';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { agents, addAgent, updateAgent, deleteAgent, duplicateAgent, exportAgents, importAgents } = useAgents();
  const { signOut, isSuperAdmin, userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: '',
    tagline: '',
    category: 'Other',
    language: ['EN'],
    prompt_source: 'text' as 'text' | 'prompt_id',
    prompt_text: '',
    prompt_id: '',
    voice: 'alloy',
    model: 'gpt-realtime-2025-08-28',
    status_type: 'deployed' as Agent['status_type'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatarUrl: '',
      tagline: '',
      category: 'Other',
      language: ['EN'],
      prompt_source: 'text',
      prompt_text: '',
      prompt_id: '',
      voice: 'alloy',
      model: 'gpt-realtime-2025-08-28',
      status_type: 'deployed',
    });
    setEditingAgent(null);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      avatarUrl: agent.avatarUrl,
      tagline: agent.tagline,
      category: agent.category,
      language: agent.language,
      prompt_source: agent.prompt_source,
      prompt_text: agent.prompt_text || '',
      prompt_id: agent.prompt_id || '',
      voice: agent.voice,
      model: agent.model,
      status_type: agent.status_type,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.tagline.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and tagline are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.prompt_source === 'text' && !formData.prompt_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Prompt text is required when using text source",
        variant: "destructive",
      });
      return;
    }

    if (formData.prompt_source === 'prompt_id' && !formData.prompt_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Prompt ID is required when using prompt_id source",
        variant: "destructive",
      });
      return;
    }

    const agentData = {
      ...formData,
      prompt_text: formData.prompt_source === 'text' ? formData.prompt_text : undefined,
      prompt_id: formData.prompt_source === 'prompt_id' ? formData.prompt_id : undefined,
    };

    if (editingAgent) {
      await updateAgent(editingAgent.id, agentData);
    } else {
      await addAgent(agentData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super administrators can delete agents.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`🚨 CONFIRMATION: Delete "${name}" permanently?`)) {
      await deleteAgent(id);
      toast({
        title: "Agent Deleted",
        description: `"${name}" has been permanently deleted.`,
      });
    }
  };

  const handleDuplicate = async (agent: Agent) => {
    const duplicatedAgent = {
      ...agent,
      id: crypto.randomUUID(),
      name: `${agent.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await addAgent(duplicatedAgent);
    toast({
      title: "Agent Duplicated",
      description: `${agent.name} has been duplicated successfully.`,
    });
  };

  const handleExport = () => {
    const data = exportAgents();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voicetube-agents.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export Complete",
      description: "Agents exported successfully",
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const success = await importAgents(content);
      if (!success) {
        toast({
          title: "Import Failed",
          description: "Invalid file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleTestPrompt = () => {
    toast({
      title: "Test Session Started",
      description: "30-second test session initiated (Demo)",
    });
  };

  const handleStatusChange = async (agentId: string, newStatus: Agent['status_type']) => {
    await updateAgent(agentId, { status_type: newStatus });
    toast({
      title: "Status Updated",
      description: `Agent status changed to ${STATUS_TYPES.find(s => s.value === newStatus)?.label}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">
              Voice AI Agents Directory Admin {isSuperAdmin && <span className="text-primary">(Super Admin)</span>}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = handleImport as any;
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              Sign Out
            </Button>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Agent Name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Avatar URL</Label>
                    <Input
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  </div>
                  
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tagline</Label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Languages</Label>
                    <div className="space-y-2">
                      {LANGUAGES.map((lang) => (
                        <div key={lang.code} className="flex items-center space-x-2">
                          <Checkbox
                            id={lang.code}
                            checked={formData.language.includes(lang.code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({ ...prev, language: [...prev.language, lang.code] }));
                              } else {
                                setFormData(prev => ({ ...prev, language: prev.language.filter(l => l !== lang.code) }));
                              }
                            }}
                          />
                          <Label htmlFor={lang.code} className="text-sm font-normal">
                            {lang.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Voice</Label>
                    <Select value={formData.voice} onValueChange={(value) => setFormData(prev => ({ ...prev, voice: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICES.map((voice) => (
                          <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                  
                 <div>
                   <Label className="text-sm font-medium mb-2 block">Status</Label>
                   <Select value={formData.status_type} onValueChange={(value: Agent['status_type']) => setFormData(prev => ({ ...prev, status_type: value }))}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {STATUS_TYPES.map((status) => (
                         <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                   
                 <div>
                   <Label className="text-sm font-medium mb-2 block">Prompt Source</Label>
                  <Select value={formData.prompt_source} onValueChange={(value: 'text' | 'prompt_id') => setFormData(prev => ({ ...prev, prompt_source: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Raw Text</SelectItem>
                      <SelectItem value="prompt_id">Prompt Library ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  
                {formData.prompt_source === 'text' ? (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Prompt Text</Label>
                    <Textarea
                      value={formData.prompt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                      placeholder="System prompt instructions..."
                      rows={6}
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Prompt Library ID</Label>
                    <Input
                      value={formData.prompt_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt_id: e.target.value }))}
                      placeholder="pmpt_..."
                    />
                  </div>
                )}
                  
                  <div className="flex justify-between">
                    <Button onClick={handleTestPrompt} variant="outline">
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Prompt
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingAgent ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">Agents Management</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agents ({agents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Tagline</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prompt Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full" />
                        </TableCell>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{agent.tagline}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{agent.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{agent.language}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={agent.status_type} 
                            onValueChange={(value: Agent['status_type']) => handleStatusChange(agent.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue>
                                <Badge 
                                  className={`text-xs font-medium ${
                                    agent.status_type === 'deployed' ? 'bg-status-deployed text-status-deployed-foreground' :
                                    agent.status_type === 'testing' ? 'bg-status-testing text-status-testing-foreground' :
                                    agent.status_type === 'building' ? 'bg-status-building text-status-building-foreground' :
                                    'bg-status-repairing text-status-repairing-foreground'
                                  }`}
                                >
                                  {STATUS_TYPES.find(s => s.value === agent.status_type)?.label || agent.status_type}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_TYPES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <Badge 
                                    className={`text-xs font-medium bg-${status.color} text-${status.color}-foreground`}
                                  >
                                    {status.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.prompt_source === 'text' ? 'default' : 'secondary'} className="text-xs">
                            {agent.prompt_source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(agent)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicate(agent)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(agent.id, agent.name)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversations" className="mt-6">
            <ConversationsRegistry />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};