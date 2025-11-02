// Start/Onboarding Flow - Provider Setup
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProvider } from "@/contexts/ProviderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Phone, Mic2, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = 'choose-provider' | 'choose-action' | 'connect-vapi';
type Action = 'import' | 'create';
type Provider = 'vapi' | 'elevenlabs' | 'orochi';

export function Start() {
  const navigate = useNavigate();
  const { addConnection } = useProvider();

  const [step, setStep] = useState<Step>('choose-provider');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providers = [
    {
      id: 'vapi' as const,
      name: 'Vapi',
      icon: <Phone className="w-12 h-12 text-purple-600" />,
      description: 'Voice AI platform for phone calls and conversational AI',
      enabled: true,
      color: 'purple',
    },
    {
      id: 'elevenlabs' as const,
      name: 'ElevenLabs',
      icon: <Mic2 className="w-12 h-12 text-orange-600" />,
      description: 'Advanced voice synthesis and cloning',
      enabled: false,
      color: 'orange',
    },
    {
      id: 'orochi' as const,
      name: 'Orochi Pipeline',
      icon: <Zap className="w-12 h-12 text-blue-600" />,
      description: 'Custom AI agent pipeline',
      enabled: false,
      color: 'blue',
    },
  ];

  const handleProviderSelect = (provider: Provider) => {
    if (!providers.find(p => p.id === provider)?.enabled) {
      toast({
        title: "Coming Soon",
        description: "This provider will be available in a future update",
        variant: "default",
      });
      return;
    }
    setSelectedProvider(provider);
    setStep('choose-action');
  };

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setStep('connect-vapi');
  };

  const handleConnectVapi = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Vapi API key');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addConnection('vapi', apiKey.trim(), label.trim() || 'Production');

      toast({
        title: "Connected!",
        description: "Successfully connected to Vapi",
      });

      // Redirect based on action
      if (selectedAction === 'import') {
        navigate('/dashboard?view=assistants&action=import');
      } else {
        navigate('/dashboard?view=assistants&action=create');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to VoxHive</h1>
          <p className="text-muted-foreground text-lg">
            Set up your first AI voice assistant in minutes
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'choose-provider' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
            }`}>
              {step !== 'choose-provider' ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <div className="w-16 h-0.5 bg-border" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'choose-action' ? 'bg-primary text-primary-foreground' :
              step === 'connect-vapi' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {step === 'connect-vapi' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <div className="w-16 h-0.5 bg-border" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'connect-vapi' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Choose Provider */}
        {step === 'choose-provider' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !provider.enabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${selectedProvider === provider.id ? `ring-2 ring-${provider.color}-500` : ''}`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {provider.icon}
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {provider.name}
                      {!provider.enabled && (
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Action */}
        {step === 'choose-action' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setStep('choose-provider')}
              className="mb-4"
            >
              ← Back
            </Button>
            <h2 className="text-2xl font-semibold text-center mb-6">What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleActionSelect('import')}
              >
                <CardHeader className="text-center">
                  <CardTitle>Import Existing Assistants</CardTitle>
                  <CardDescription className="mt-4">
                    Connect your {selectedProvider === 'vapi' ? 'Vapi' : ''} account and import your existing assistants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sync existing assistants</li>
                    <li>• Manage from one dashboard</li>
                    <li>• Track usage & costs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleActionSelect('create')}
              >
                <CardHeader className="text-center">
                  <CardTitle>Create New Assistant</CardTitle>
                  <CardDescription className="mt-4">
                    Start from scratch with our guided assistant creator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Quick start templates</li>
                    <li>• Step-by-step guidance</li>
                    <li>• Deploy in minutes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Connect Vapi */}
        {step === 'connect-vapi' && selectedProvider === 'vapi' && (
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => setStep('choose-action')}
              className="mb-4"
            >
              ← Back
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Connect to Vapi</CardTitle>
                <CardDescription>
                  Enter your Vapi API key to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Connection Label (Optional)
                  </label>
                  <Input
                    placeholder="Production"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Give this connection a name to identify it later
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Vapi API Key <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your Vapi API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored securely and never shared
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Where to find your API key:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard.vapi.ai</a></li>
                    <li>Navigate to Settings → API Keys</li>
                    <li>Copy your organization API key</li>
                  </ol>
                </div>

                <Button
                  className="w-full"
                  onClick={handleConnectVapi}
                  disabled={loading || !apiKey.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Connect & Continue'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll validate your API key and {selectedAction === 'import' ? 'fetch your assistants' : 'set up a new assistant'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
