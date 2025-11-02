import { useState, useEffect } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { Plus, Workflow, Search, Trash2, Copy, GitBranch, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VapiWorkflow } from "@/services/vapi/workflow-types";

interface WorkflowDirectoryProps {
  onSelectWorkflow: (workflowId: string) => void;
}

export function WorkflowDirectory({ onSelectWorkflow }: WorkflowDirectoryProps) {
  const { getVapiClient } = useProvider();
  const [workflows, setWorkflows] = useState<VapiWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      setLoading(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('🔄 Loading workflows...');
      const data = await client.listWorkflows();
      console.log('✅ Loaded workflows:', data.length, data);

      setWorkflows(data || []);
    } catch (error) {
      console.error('❌ Failed to load workflows:', error);
      toast({
        title: "Failed to load workflows",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWorkflow() {
    if (!newWorkflowName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('🆕 Creating workflow:', newWorkflowName);

      // Create a basic workflow with a conversation node
      const newWorkflow = await client.createWorkflow({
        name: newWorkflowName,
        description: newWorkflowDescription || undefined,
        nodes: [
          {
            type: 'conversation',
            name: 'Start',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant.',
              },
            ],
          },
        ],
        edges: [],
      });

      console.log('✅ Created workflow:', newWorkflow);

      toast({
        title: "Workflow created",
        description: `Created ${newWorkflowName}`,
      });

      setShowCreateDialog(false);
      setNewWorkflowName("");
      setNewWorkflowDescription("");
      await loadWorkflows();

      // Navigate to the new workflow
      onSelectWorkflow(newWorkflow.id);
    } catch (error) {
      console.error('❌ Failed to create workflow:', error);
      toast({
        title: "Failed to create workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteWorkflow(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const client = getVapiClient();
      if (!client) return;

      console.log('🗑️ Deleting workflow:', id);
      await client.deleteWorkflow(id);

      toast({
        title: "Workflow deleted",
        description: `Deleted ${name}`,
      });

      await loadWorkflows();
    } catch (error) {
      console.error('❌ Failed to delete workflow:', error);
      toast({
        title: "Failed to delete workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleDuplicateWorkflow(workflow: VapiWorkflow) {
    try {
      const client = getVapiClient();
      if (!client) return;

      console.log('📋 Duplicating workflow:', workflow.id);

      const duplicate = await client.createWorkflow({
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        nodes: workflow.nodes.map(({ id, position, ...node }) => node),
        edges: workflow.edges.map(({ id, ...edge }) => edge),
        model: workflow.model,
        voice: workflow.voice,
        transcriber: workflow.transcriber,
        recordingEnabled: workflow.recordingEnabled,
        serverUrl: workflow.serverUrl,
      });

      toast({
        title: "Workflow duplicated",
        description: `Created ${duplicate.name}`,
      });

      await loadWorkflows();
    } catch (error) {
      console.error('❌ Failed to duplicate workflow:', error);
      toast({
        title: "Failed to duplicate workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  function handleExportWorkflow(workflow: VapiWorkflow) {
    try {
      // Create export data
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
          model: workflow.model,
          voice: workflow.voice,
          transcriber: workflow.transcriber,
          recordingEnabled: workflow.recordingEnabled,
          serverUrl: workflow.serverUrl,
        },
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}-workflow.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Workflow exported",
        description: `Downloaded ${workflow.name}.json`,
      });
    } catch (error) {
      console.error('❌ Failed to export workflow:', error);
      toast({
        title: "Failed to export workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Workflow className="w-6 h-6" />
            Workflows
          </h1>
          <p className="text-muted-foreground mt-1">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No workflows match your search' : 'No workflows yet'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Workflow
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onSelectWorkflow(workflow.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                      <GitBranch className="w-6 h-6 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportWorkflow(workflow);
                      }}
                      title="Export to JSON"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateWorkflow(workflow);
                      }}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(workflow.id, workflow.name);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-3">{workflow.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {workflow.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline">
                      {workflow.edges.length} edge{workflow.edges.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new workflow to build voice conversation flows
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                placeholder="Customer Support Flow"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Handles customer inquiries and routes to appropriate departments"
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewWorkflowName("");
                setNewWorkflowDescription("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={creating || !newWorkflowName.trim()}>
              {creating ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
