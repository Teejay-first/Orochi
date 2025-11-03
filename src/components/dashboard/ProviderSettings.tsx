// Provider Settings - Manage API Keys and Connections
import { useState } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export function ProviderSettings() {
  const { connections, activeConnection, addConnection, removeConnection, setActiveConnection, testConnection, loading } = useProvider();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProvider, setNewProvider] = useState<'vapi' | 'elevenlabs' | 'orochi'>('vapi');
  const [newApiKey, setNewApiKey] = useState('');
  const [newPublicKey, setNewPublicKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddConnection = async () => {
    if (!newApiKey.trim()) {
      setError('Please enter a private API key');
      return;
    }

    // For Vapi, require public key for voice calls
    if (newProvider === 'vapi' && !newPublicKey.trim()) {
      setError('Please enter a public API key (required for voice calls)');
      return;
    }

    try {
      setAdding(true);
      setError(null);

      await addConnection(
        newProvider,
        newApiKey.trim(),
        newLabel.trim() || undefined,
        newProvider === 'vapi' ? newPublicKey.trim() : undefined
      );

      toast({
        title: "Connection Added",
        description: `Successfully added ${newProvider} connection`,
      });

      setShowAddDialog(false);
      setNewApiKey('');
      setNewPublicKey('');
      setNewLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add connection');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveConnection = async (id: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      await removeConnection(id);
      toast({
        title: "Connection Removed",
        description: "Successfully removed connection",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to remove connection',
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      setTesting(id);
      const isValid = await testConnection(id);

      toast({
        title: isValid ? "Connection Valid" : "Connection Failed",
        description: isValid ? "API key is working correctly" : "Failed to validate API key",
        variant: isValid ? "default" : "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveConnection(id);
      toast({
        title: "Active Connection Updated",
        description: "Successfully switched active connection",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to switch connection',
        variant: "destructive",
      });
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'vapi':
        return { name: 'Vapi', emoji: '🟣', color: 'purple' };
      case 'elevenlabs':
        return { name: 'ElevenLabs', emoji: '🎙️', color: 'orange' };
      case 'orochi':
        return { name: 'Orochi Pipeline', emoji: '🔵', color: 'blue' };
      default:
        return { name: provider, emoji: '⚡', color: 'gray' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Provider Connections
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys and provider connections
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Connections List */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No provider connections configured</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => {
            const providerInfo = getProviderInfo(connection.provider);
            const isActive = activeConnection?.id === connection.id;

            return (
              <Card 
                key={connection.id} 
                className={isActive ? 'border-default shadow-system-sm' : ''}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{providerInfo.emoji}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {providerInfo.name}
                          {isActive && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {connection.label || 'Unnamed connection'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActive(connection.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(connection.id)}
                        disabled={testing === connection.id}
                        title="Test Connection"
                      >
                        {testing === connection.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveConnection(connection.id)}
                        title="Remove Connection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Private API Key
                      </div>
                      <div className="font-mono text-sm text-foreground bg-muted/50 px-2 py-1.5 rounded border border-border">
                        {connection.apiKey.substring(0, 8)}...{connection.apiKey.slice(-4)}
                      </div>
                    </div>
                    {connection.publicKey && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Public API Key
                        </div>
                        <div className="font-mono text-sm text-foreground bg-muted/50 px-2 py-1.5 rounded border border-border">
                          {connection.publicKey.substring(0, 8)}...{connection.publicKey.slice(-4)}
                        </div>
                      </div>
                    )}
                    {connection.orgId && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Organization
                        </div>
                        <div className="text-sm text-foreground">
                          {connection.orgId}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Verified
                      </div>
                      <div className="text-sm text-foreground">
                        {connection.lastVerifiedAt
                          ? formatDistanceToNow(new Date(connection.lastVerifiedAt), { addSuffix: true })
                          : <span className="text-muted-foreground">Never</span>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Added
                      </div>
                      <div className="text-sm text-foreground">
                        {formatDistanceToNow(new Date(connection.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Provider Connection</DialogTitle>
            <DialogDescription>
              Connect a new provider by entering your API key
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={newProvider === 'vapi' ? 'default' : 'outline'}
                  onClick={() => setNewProvider('vapi')}
                  className="flex-col h-auto py-4"
                >
                  <span className="text-2xl mb-1">🟣</span>
                  <span className="text-xs">Vapi</span>
                </Button>
                <Button
                  variant={newProvider === 'elevenlabs' ? 'default' : 'outline'}
                  onClick={() => setNewProvider('elevenlabs')}
                  className="flex-col h-auto py-4"
                  disabled
                >
                  <span className="text-2xl mb-1">🎙️</span>
                  <span className="text-xs">ElevenLabs</span>
                  <Badge variant="outline" className="text-xs mt-1">Soon</Badge>
                </Button>
                <Button
                  variant={newProvider === 'orochi' ? 'default' : 'outline'}
                  onClick={() => setNewProvider('orochi')}
                  className="flex-col h-auto py-4"
                  disabled
                >
                  <span className="text-2xl mb-1">🔵</span>
                  <span className="text-xs">Orochi</span>
                  <Badge variant="outline" className="text-xs mt-1">Soon</Badge>
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Connection Label (Optional)
              </label>
              <Input
                placeholder="Production, Staging, etc."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Private API Key <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                placeholder="Enter your private API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for server-side API calls (assistants, files, etc.)
              </p>
            </div>

            {newProvider === 'vapi' && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Public API Key <span className="text-destructive">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Enter your public API key"
                  value={newPublicKey}
                  onChange={(e) => setNewPublicKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for voice calls (safe to use in browser)
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddConnection}
              disabled={adding || !newApiKey.trim() || (newProvider === 'vapi' && !newPublicKey.trim())}
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Connection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

