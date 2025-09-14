import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent, CATEGORIES, LANGUAGES, VOICES } from '@/types/agent';
import { useAgents } from '@/contexts/AgentContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Copy, Trash2, Download, Upload, Home, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ConversationsRegistry } from '@/components/ConversationsRegistry';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { agents, addAgent, updateAgent, deleteAgent, duplicateAgent, exportAgents, importAgents } = useAgents();
  const { signOut, roles } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: '',
    tagline: '',
    category: 'Other',
    language: 'EN',
    prompt_source: 'text' as 'text' | 'prompt_id',
    prompt_text: '',
    prompt_id: '',
    voice: 'alloy',
    model: 'gpt-realtime-2025-08-28',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatarUrl: '',
      tagline: '',
      category: 'Other',
      language: 'EN',
      prompt_source: 'text',
      prompt_text: '',
      prompt_id: '',
      voice: 'alloy',
      model: 'gpt-realtime-2025-08-28',
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
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const agentData: Omit<Agent, 'id'> = {
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        tagline: formData.tagline,
        category: formData.category,
        language: formData.language,
        prompt_source: formData.prompt_source,
        prompt_text: formData.prompt_source === 'text' ? formData.prompt_text : null,
        prompt_id: formData.prompt_source === 'prompt_id' ? formData.prompt_id : null,
        voice: formData.voice,
        model: formData.model,
        createdAt: editingAgent?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      if (editingAgent) {
        await updateAgent(editingAgent.id, agentData);
        toast({
          title: "Agent Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await addAgent(agentData);
        toast({
          title: "Agent Created",
          description: `${formData.name} has been created successfully.`,
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Error",
        description: "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!roles.isSuper) {
      toast({
        title: "Access Denied",
        description: "Only super administrators can delete agents.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) {
      try {
        await deleteAgent(agent.id);
        toast({
          title: "Agent Deleted",
          description: `${agent.name} has been deleted successfully.`,
        });
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast({
          title: "Error",
          description: "Failed to delete agent. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = async (agent: Agent) => {
    try {
      await duplicateAgent(agent.id);
      toast({
        title: "Agent Duplicated",
        description: `Copy of ${agent.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error duplicating agent:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      exportAgents();
      toast({
        title: "Export Successful",
        description: "Agents exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting agents:', error);
      toast({
        title: "Error",
        description: "Failed to export agents. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importAgents(text);
      toast({
        title: "Import Successful",
        description: "Agents imported successfully.",
      });
    } catch (error) {
      console.error('Error importing agents:', error);
      toast({
        title: "Error",
        description: "Failed to import agents. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">VoiceTube Admin Panel</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">Agents Management</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Agent Management</CardTitle>
                  <div className="flex items-center gap-2">
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
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Agent name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="avatarUrl">Avatar URL</Label>
                              <Input
                                id="avatarUrl"
                                value={formData.avatarUrl}
                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                              id="tagline"
                              value={formData.tagline}
                              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                              placeholder="Brief description"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="language">Language</Label>
                              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {LANGUAGES.map((language) => (
                                    <SelectItem key={language.code} value={language.code}>
                                      {language.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="voice">Voice</Label>
                              <Select value={formData.voice} onValueChange={(value) => setFormData({ ...formData, voice: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select voice" />
                                </SelectTrigger>
                                <SelectContent>
                                  {VOICES.map((voice) => (
                                    <SelectItem key={voice} value={voice}>
                                      {voice}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="prompt_source">Prompt Source</Label>
                            <Select value={formData.prompt_source} onValueChange={(value: 'text' | 'prompt_id') => setFormData({ ...formData, prompt_source: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select prompt source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Custom Text</SelectItem>
                                <SelectItem value="prompt_id">Prompt ID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.prompt_source === 'text' ? (
                            <div className="space-y-2">
                              <Label htmlFor="prompt_text">Prompt Text</Label>
                              <Textarea
                                id="prompt_text"
                                value={formData.prompt_text}
                                onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                                placeholder="Enter the agent's prompt..."
                                rows={6}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor="prompt_id">Prompt ID</Label>
                              <Input
                                id="prompt_id"
                                value={formData.prompt_id}
                                onChange={(e) => setFormData({ ...formData, prompt_id: e.target.value })}
                                placeholder="Enter prompt ID"
                              />
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              {editingAgent ? 'Update' : 'Create'} Agent
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    
                    <Button variant="outline" asChild>
                      <label htmlFor="import">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </label>
                    </Button>
                    <input
                      id="import"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Voice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <img
                                src={agent.avatarUrl}
                                alt={agent.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-semibold">{agent.name}</div>
                                <div className="text-sm text-muted-foreground">{agent.tagline}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{agent.category}</Badge>
                          </TableCell>
                          <TableCell>{agent.language}</TableCell>
                          <TableCell>{agent.voice}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(agent)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(agent)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              {roles.isSuper && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(agent)}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationsRegistry />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};