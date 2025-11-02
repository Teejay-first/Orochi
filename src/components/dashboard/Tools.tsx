import { useState, useEffect } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { Wrench, Plus, Trash2, Code, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { VapiTool } from "@/services/vapi/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

// Vapi's built-in tools
const PREDEFINED_TOOLS = [
  {
    type: 'transferCall',
    name: 'Transfer Call',
    description: 'Transfer the current call to a configured phone number or destination',
    icon: '📞',
  },
  {
    type: 'endCall',
    name: 'End Call',
    description: 'Terminate the current call',
    icon: '📴',
  },
  {
    type: 'sms',
    name: 'Send SMS',
    description: 'Send a text message via Twilio',
    icon: '💬',
  },
  {
    type: 'dtmf',
    name: 'DTMF Keypad',
    description: 'Enter digits on the keypad for IVR navigation',
    icon: '🔢',
  },
  {
    type: 'apiRequest',
    name: 'API Request',
    description: 'Make HTTP requests to external APIs with custom parameters',
    icon: '🌐',
  },
];

export function Tools() {
  const { getVapiClient } = useProvider();
  const [tools, setTools] = useState<VapiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [functionName, setFunctionName] = useState("");
  const [description, setDescription] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [serverSecret, setServerSecret] = useState("");
  const [parametersJson, setParametersJson] = useState(`{
  "type": "object",
  "properties": {
    "param1": {
      "type": "string",
      "description": "Description of param1"
    }
  },
  "required": ["param1"]
}`);

  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools() {
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

      console.log('🔧 Loading tools from Vapi...');
      const data = await client.listTools();
      console.log('✅ Loaded tools:', data.length);

      setTools(data);
    } catch (error) {
      console.error('❌ Failed to load tools:', error);
      toast({
        title: "Failed to load tools",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCreateTool() {
    setCreateDialogOpen(true);
  }

  function resetForm() {
    setFunctionName("");
    setDescription("");
    setServerUrl("");
    setServerSecret("");
    setParametersJson(`{
  "type": "object",
  "properties": {
    "param1": {
      "type": "string",
      "description": "Description of param1"
    }
  },
  "required": ["param1"]
}`);
  }

  async function handleSubmitTool() {
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

      // Validate required fields
      if (!functionName.trim()) {
        toast({
          title: "Validation error",
          description: "Function name is required",
          variant: "destructive",
        });
        return;
      }

      if (!serverUrl.trim()) {
        toast({
          title: "Validation error",
          description: "Server URL is required",
          variant: "destructive",
        });
        return;
      }

      // Parse parameters JSON
      let parameters;
      try {
        parameters = JSON.parse(parametersJson);
      } catch (e) {
        toast({
          title: "Invalid JSON",
          description: "Parameters must be valid JSON",
          variant: "destructive",
        });
        return;
      }

      const toolData = {
        type: 'function' as const,
        function: {
          name: functionName,
          description: description || undefined,
          parameters,
        },
        server: {
          url: serverUrl,
          secret: serverSecret || undefined,
        },
      };

      console.log('📤 Creating tool:', toolData);
      await client.createTool(toolData);

      toast({
        title: "Tool created",
        description: `Successfully created ${functionName}`,
      });

      setCreateDialogOpen(false);
      resetForm();
      await loadTools();
    } catch (error) {
      console.error('❌ Failed to create tool:', error);
      toast({
        title: "Failed to create tool",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTool(toolId: string, toolName: string) {
    try {
      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('🗑️ Deleting tool:', toolId);
      await client.deleteTool(toolId);

      toast({
        title: "Tool deleted",
        description: `Deleted ${toolName}`,
      });

      await loadTools();
    } catch (error) {
      console.error('❌ Failed to delete tool:', error);
      toast({
        title: "Failed to delete tool",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tools...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Tools & Functions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage function calling tools for your assistants
          </p>
        </div>
        <Button onClick={handleCreateTool}>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Tool
        </Button>
      </div>

      {/* Predefined Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Vapi Built-in Tools</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            These tools are provided by Vapi and can be added to any assistant. Configure them in the assistant's settings.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREDEFINED_TOOLS.map((tool) => (
              <Card key={tool.type} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{tool.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {tool.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Tools */}
      {tools.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Custom Tools</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No custom tools found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom function calling tools for your assistants
            </p>
            <Button onClick={handleCreateTool}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tool
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Custom Tools ({tools.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Server URL</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium font-mono">
                      {tool.function.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tool.function.description || 'No description'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {tool.server?.url || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tool.createdAt
                        ? formatDistanceToNow(new Date(tool.createdAt), { addSuffix: true })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Tool details",
                              description: JSON.stringify(tool.function.parameters, null, 2),
                            });
                          }}
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTool(tool.id, tool.function.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Tools enable your assistants to call external functions and APIs during conversations.
          </p>
          <p className="text-sm text-muted-foreground">
            Define function schemas with parameters, and Vapi will handle the execution flow automatically.
          </p>
          <p className="text-sm text-muted-foreground">
            The server URL is where Vapi will POST the function call request with parameters.
          </p>
        </CardContent>
      </Card>

      {/* Create Tool Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Function Tool</DialogTitle>
            <DialogDescription>
              Define a custom function that your assistants can call during conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="functionName">Function Name *</Label>
              <Input
                id="functionName"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="get_weather"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gets the current weather for a location"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="serverUrl">Server URL *</Label>
              <Input
                id="serverUrl"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-api.com/functions/get_weather"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Vapi will POST to this URL when the function is called
              </p>
            </div>

            <div>
              <Label htmlFor="serverSecret">Server Secret (optional)</Label>
              <Input
                id="serverSecret"
                type="password"
                value={serverSecret}
                onChange={(e) => setServerSecret(e.target.value)}
                placeholder="Secret for authentication"
              />
            </div>

            <div>
              <Label htmlFor="parameters">Parameters (JSON Schema)</Label>
              <Textarea
                id="parameters"
                value={parametersJson}
                onChange={(e) => setParametersJson(e.target.value)}
                className="font-mono text-sm"
                rows={12}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define the function parameters using JSON Schema format
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitTool} disabled={creating}>
              {creating ? 'Creating...' : 'Create Tool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
