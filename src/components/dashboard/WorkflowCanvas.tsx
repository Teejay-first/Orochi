import { useState, useEffect, useCallback, useMemo } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MiniMap,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { ChevronLeft, Save, Play, Plus, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { VapiWorkflow, WorkflowNode, WorkflowNodeType, WorkflowNodeTemplates } from "@/services/vapi/workflow-types";
import { ConversationNode } from "./workflow-nodes/ConversationNode";
import { ApiRequestNode } from "./workflow-nodes/ApiRequestNode";
import { TransferNode } from "./workflow-nodes/TransferNode";
import { EndCallNode } from "./workflow-nodes/EndCallNode";
import { ToolNode } from "./workflow-nodes/ToolNode";
import { ExtractVariablesNode } from "./workflow-nodes/ExtractVariablesNode";
import { ConditionNode } from "./workflow-nodes/ConditionNode";
import { GlobalNode } from "./workflow-nodes/GlobalNode";

interface WorkflowCanvasProps {
  workflowId: string | null;
  onBack: () => void;
}

export function WorkflowCanvas({ workflowId, onBack }: WorkflowCanvasProps) {
  const { getVapiClient } = useProvider();
  const [workflow, setWorkflow] = useState<VapiWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Custom node types for ReactFlow
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      conversation: ConversationNode,
      apiRequest: ApiRequestNode,
      transfer: TransferNode,
      endCall: EndCallNode,
      tool: ToolNode,
      extractVariables: ExtractVariablesNode,
      condition: ConditionNode,
      global: GlobalNode,
    }),
    []
  );

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  async function loadWorkflow() {
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

      console.log('🔍 Loading workflow:', workflowId);
      const data = await client.getWorkflow(workflowId!);
      console.log('📋 Loaded workflow:', data);

      setWorkflow(data);

      // Convert Vapi workflow nodes to ReactFlow nodes
      const reactFlowNodes: Node[] = data.nodes.map((node, index) => ({
        id: node.id || `node-${index}`,
        type: node.type,
        position: node.position || { x: index * 250, y: 100 },
        data: { ...node },
      }));

      // Convert Vapi workflow edges to ReactFlow edges
      const reactFlowEdges: Edge[] = data.edges.map((edge, index) => ({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || (edge.conditionType === 'ai' ? 'AI' : edge.conditionType === 'logic' ? 'Logic' : ''),
        type: 'smoothstep',
        animated: edge.conditionType === 'ai',
        data: {
          conditionType: edge.conditionType,
          aiCondition: edge.aiCondition,
          logicCondition: edge.logicCondition,
        },
      }));

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);

      toast({
        title: "Workflow loaded",
        description: `Loaded ${data.name}`,
      });
    } catch (error) {
      console.error('❌ Failed to load workflow:', error);
      toast({
        title: "Failed to load workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!workflow) return;

    try {
      setSaving(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      // Convert ReactFlow nodes back to Vapi workflow nodes
      const vapiNodes: Omit<WorkflowNode, 'id' | 'position'>[] = nodes.map((node) => {
        const { id, position, ...nodeData } = node.data;
        return {
          type: node.type as WorkflowNodeType,
          ...nodeData,
        };
      });

      // Convert ReactFlow edges back to Vapi workflow edges
      const vapiEdges = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        label: edge.label as string | undefined,
        conditionType: edge.data?.conditionType,
        aiCondition: edge.data?.aiCondition,
        logicCondition: edge.data?.logicCondition,
      }));

      const updates = {
        nodes: vapiNodes,
        edges: vapiEdges,
      };

      console.log('💾 Saving workflow updates:', updates);
      await client.updateWorkflow(workflow.id, updates);

      toast({
        title: "Saved!",
        description: "Workflow updated successfully in Vapi",
      });

      // Reload to show updated data
      await loadWorkflow();
    } catch (error) {
      console.error('❌ Failed to save workflow:', error);
      toast({
        title: "Failed to save workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: false,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  function handleAddNode(type: WorkflowNodeType) {
    const template = WorkflowNodeTemplates[type];
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        ...template,
        id: `node-${Date.now()}`,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    toast({
      title: "Node added",
      description: `Added ${template.name} node`,
    });
  }

  function handleExportWorkflow() {
    if (!workflow) return;

    try {
      // Create export data with workflow metadata and current canvas state
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            data: edge.data,
          })),
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

  function handleImportWorkflow() {
    try {
      // Create file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importData = JSON.parse(text);

          // Validate import data
          if (!importData.workflow || !importData.workflow.nodes || !importData.workflow.edges) {
            throw new Error("Invalid workflow JSON format");
          }

          // Convert imported nodes to ReactFlow format
          const importedNodes: Node[] = importData.workflow.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: node.position || { x: 0, y: 0 },
            data: node.data,
          }));

          // Convert imported edges to ReactFlow format
          const importedEdges: Edge[] = importData.workflow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: 'smoothstep',
            animated: edge.data?.conditionType === 'ai',
            data: edge.data,
          }));

          setNodes(importedNodes);
          setEdges(importedEdges);

          toast({
            title: "Workflow imported",
            description: `Loaded ${importedNodes.length} nodes and ${importedEdges.length} edges. Click Save to persist changes.`,
          });
        } catch (error) {
          console.error('❌ Failed to import workflow:', error);
          toast({
            title: "Failed to import workflow",
            description: error instanceof Error ? error.message : "Invalid JSON file",
            variant: "destructive",
          });
        }
      };

      input.click();
    } catch (error) {
      console.error('❌ Failed to trigger import:', error);
      toast({
        title: "Failed to import workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Workflow not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{workflow.name}</h1>
            <p className="text-xs text-muted-foreground">
              {nodes.length} nodes, {edges.length} edges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default">Active</Badge>
          <Button variant="outline" size="sm" onClick={handleImportWorkflow}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWorkflow}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />

          {/* Node Palette */}
          <Panel position="top-left">
            <Card className="w-64">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('conversation')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Conversation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('apiRequest')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  API Request
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('extractVariables')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Extract Variables
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('transfer')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('condition')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Condition
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('tool')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tool
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('endCall')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  End Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleAddNode('global')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Global
                </Button>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
