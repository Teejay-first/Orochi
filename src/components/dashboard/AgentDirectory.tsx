import { useState, useEffect } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { Plus, Search, Settings, Pause, Archive, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { LiveStatsWidget } from "./LiveStatsWidget";
import type { VapiAssistant } from "@/services/vapi/types";

interface AgentDirectoryProps {
  onConfigureAgent: (agentId: string) => void;
}

export function AgentDirectory({ onConfigureAgent }: AgentDirectoryProps) {
  const { getVapiClient } = useProvider();
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAssistants();
  }, []);

  async function loadAssistants() {
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

      console.log('✅ Vapi client available, fetching assistants...');
      const data = await client.listAssistants();
      console.log('📋 Fetched assistants:', data);
      console.log('📋 Number of assistants:', data.length);
      console.log('📋 First assistant:', data[0]);

      setAssistants(data);
      console.log('✅ State updated with assistants');

      toast({
        title: "Assistants loaded",
        description: `Loaded ${data.length} assistant(s) from Vapi`,
      });
    } catch (error) {
      console.error('❌ Failed to load assistants:', error);
      toast({
        title: "Failed to load assistants",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setAssistants([]);
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  }

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('🎨 Render - assistants state:', assistants);
  console.log('🎨 Render - filteredAssistants:', filteredAssistants);
  console.log('🎨 Render - loading:', loading);

  const getStatusBadge = (assistant: VapiAssistant) => {
    // Vapi assistants don't have explicit status, so we'll use a simple logic
    return <Badge variant="default">Active</Badge>;
  };

  const getVoiceProvider = (assistant: VapiAssistant) => {
    if (!assistant.voice) return 'Default';

    // Check voice provider type
    if ('provider' in assistant.voice) {
      return assistant.voice.provider;
    }

    return 'Custom';
  };

  const getVoiceName = (assistant: VapiAssistant) => {
    if (!assistant.voice) return 'Default';

    if ('voiceId' in assistant.voice) {
      return assistant.voice.voiceId;
    }

    return 'Default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Vapi assistants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Stats Widget */}
      <LiveStatsWidget />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Assistants</h1>
          <Badge variant="outline" className="text-xs">
            {assistants.length} total
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search assistants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button variant="outline" onClick={loadAssistants} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Assistant
          </Button>
        </div>
      </div>

      {/* Assistants Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="h-12">Assistant Name</TableHead>
              <TableHead className="h-12">Model</TableHead>
              <TableHead className="h-12">Voice Provider</TableHead>
              <TableHead className="h-12">Voice</TableHead>
              <TableHead className="h-12">Status</TableHead>
              <TableHead className="h-12">Created</TableHead>
              <TableHead className="h-12 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssistants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No assistants found matching your search' : 'No assistants found. Create your first assistant!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAssistants.map((assistant) => (
                <TableRow key={assistant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full shrink-0" />
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {(assistant.name || 'UN').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm text-foreground truncate">{assistant.name || 'Unnamed Assistant'}</span>
                        {assistant.id && (
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {assistant.id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className="text-xs">
                      {assistant.model?.model || 'gpt-4'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm capitalize text-foreground">{getVoiceProvider(assistant)}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarFallback className="text-xs">
                          {getVoiceName(assistant).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground truncate">{getVoiceName(assistant)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(assistant)}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {assistant.createdAt
                      ? formatDistanceToNow(new Date(assistant.createdAt), { addSuffix: true })
                      : 'Unknown'
                    }
                  </TableCell>
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onConfigureAgent(assistant.id)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(assistant.id);
                            toast({
                              title: "Copied!",
                              description: "Assistant ID copied to clipboard",
                            });
                          }}
                        >
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
