import { useState, useEffect, useRef } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { ChevronLeft, Save, Code, Phone, PhoneCall, PhoneOff, MessageSquare } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LiveAgentTester } from "./LiveAgentTester";

interface AgentConfigurationProps {
  agentId: string | null;
  onBack: () => void;
}

export function AgentConfiguration({ agentId, onBack }: AgentConfigurationProps) {
  const { getVapiClient, getVapiPublicKey, updatePublicKey } = useProvider();
  const [assistant, setAssistant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [name, setName] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [endCallMessage, setEndCallMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(250);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [serverUrl, setServerUrl] = useState("");

  // Model fields
  const [modelProvider, setModelProvider] = useState("openai");
  const [modelName, setModelName] = useState("gpt-4");

  // Voice fields
  const [voiceProvider, setVoiceProvider] = useState("11labs");
  const [voiceId, setVoiceId] = useState("");

  // Tools & Knowledge Base
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<any[]>([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState("");

  // Direct file attachment
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Test call dialog
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initiatingCall, setInitiatingCall] = useState(false);
  const [currentCall, setCurrentCall] = useState<any>(null);

  // Voice call state
  const vapiRef = useRef<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');

  // Public key setup dialog
  const [publicKeyDialogOpen, setPublicKeyDialogOpen] = useState(false);
  const [tempPublicKey, setTempPublicKey] = useState('');
  const [savingPublicKey, setSavingPublicKey] = useState(false);

  const [showRawJson, setShowRawJson] = useState(false);

  // Live Agent Tester
  const [liveTesterOpen, setLiveTesterOpen] = useState(false);

  // Available options from Vapi docs
  const modelProviders = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "together-ai", label: "Together AI" },
    { value: "anyscale", label: "Anyscale" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "perplexity-ai", label: "Perplexity AI" },
    { value: "deepinfra", label: "DeepInfra" },
    { value: "groq", label: "Groq" },
  ];

  const modelsByProvider: Record<string, string[]> = {
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    "anthropic": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    "together-ai": ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"],
    "anyscale": ["meta-llama/Meta-Llama-3.1-70B-Instruct", "meta-llama/Meta-Llama-3.1-8B-Instruct"],
    "openrouter": ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"],
    "perplexity-ai": ["llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online"],
    "deepinfra": ["meta-llama/Meta-Llama-3.1-70B-Instruct", "meta-llama/Meta-Llama-3.1-8B-Instruct"],
    "groq": ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"],
  };

  const voiceProviders = [
    { value: "11labs", label: "ElevenLabs" },
    { value: "playht", label: "PlayHT" },
    { value: "deepgram", label: "Deepgram" },
    { value: "openai", label: "OpenAI" },
    { value: "azure", label: "Azure" },
    { value: "rime-ai", label: "Rime AI" },
    { value: "neets", label: "Neets" },
  ];

  const voicesByProvider: Record<string, string[]> = {
    "11labs": [
      "21m00Tcm4TlvDq8ikWAM", // Rachel
      "EXAVITQu4vr4xnSDxMaL", // Bella
      "ErXwobaYiN019PkySvjV", // Antoni
      "MF3mGyEYCl7XYWbV9V6O", // Elli
      "TxGEqnHWrfWFTfGW9XjX", // Josh
      "VR6AewLTigWG4xSOukaG", // Arnold
      "pNInz6obpgDQGcFmaJgB", // Adam
      "yoZ06aMxZJJ28mfd3POQ", // Sam
    ],
    "playht": [
      "jennifer", "melissa", "will", "chris", "matt", "jack",
      "ruby", "davis", "donna", "michael"
    ],
    "deepgram": [
      "luna", "stella", "asteria", "athena", "hera", "orion",
      "arcas", "perseus", "angus", "orpheus"
    ],
    "openai": [
      "alloy", "echo", "fable", "onyx", "nova", "shimmer"
    ],
    "azure": [
      "en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural",
      "en-US-DavisNeural", "en-US-AmberNeural", "en-US-AshleyNeural"
    ],
    "rime-ai": [
      "voice1", "voice2", "voice3", "voice4"
    ],
    "neets": [
      "voice1", "voice2", "voice3", "voice4"
    ],
  };

  useEffect(() => {
    if (agentId) {
      loadAssistant();
    }
  }, [agentId]);

  useEffect(() => {
    loadToolsAndKnowledgeBases();
  }, []);

  // Initialize Vapi client
  useEffect(() => {
    const publicKey = getVapiPublicKey();

    if (publicKey) {
      try {
        console.log('🔑 Initializing Vapi Web SDK with PUBLIC key:', publicKey.substring(0, 10) + '...');

        const vapi = new Vapi(publicKey);
        vapiRef.current = vapi;
        console.log('✅ Vapi Web SDK initialized successfully with public key');

        // Set up event listeners
        vapi.on('call-start', () => {
          console.log('📞 Call started');
          setIsCallActive(true);
          setCallStatus('Connected');
        });

        vapi.on('call-end', () => {
          console.log('📴 Call ended');
          setIsCallActive(false);
          setCallStatus('');
        });

        vapi.on('speech-start', () => {
          console.log('🗣️ Assistant speech started');
          setCallStatus('Assistant speaking...');
        });

        vapi.on('speech-end', () => {
          console.log('🤫 Assistant speech ended');
          setCallStatus('Listening...');
        });

        vapi.on('error', (error) => {
          console.error('❌ Vapi error:', error);
          setCallStatus(`Error: ${error.message}`);
          toast({
            title: "Call error",
            description: error.message,
            variant: "destructive",
          });
        });

        vapi.on('message', (message) => {
          console.log('💬 Vapi message:', message);
        });

        // Cleanup
        return () => {
          if (vapi) {
            console.log('🧹 Cleaning up Vapi client');
            vapi.stop();
          }
        };
      } catch (error) {
        console.error('❌ Failed to initialize Vapi client:', error);
      }
    } else {
      console.warn('⚠️ No public API key available for Web SDK initialization. Please add a public key in Settings.');
    }
  }, []);

  async function loadToolsAndKnowledgeBases() {
    try {
      const client = getVapiClient();
      if (!client) {
        console.warn('⚠️ Vapi client not available when loading tools and knowledge bases');
        return;
      }

      console.log('🔧 Loading tools, knowledge bases, and files...');

      // Load available tools
      const tools = await client.listTools();
      setAvailableTools(tools || []);
      console.log('✅ Loaded tools:', tools.length, tools);

      // Load available knowledge bases
      const knowledgeBases = await client.listKnowledgeBases();
      setAvailableKnowledgeBases(knowledgeBases || []);
      console.log('✅ Loaded knowledge bases:', knowledgeBases.length, knowledgeBases);

      // Load available files
      const files = await client.listFiles();
      setAvailableFiles(files || []);
      console.log('✅ Loaded files:', files.length, files);
    } catch (error) {
      console.error('❌ Failed to load tools and knowledge bases:', error);
      toast({
        title: "Warning",
        description: "Could not load tools and knowledge bases. They may not be available for selection.",
        variant: "destructive",
      });
    }
  }

  async function loadAssistant() {
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

      console.log('🔍 Loading assistant:', agentId);
      const data = await client.getAssistant(agentId!);
      console.log('📋 Loaded assistant - FULL DATA:', JSON.stringify(data, null, 2));

      setAssistant(data);
      setName(data.name || '');
      setFirstMessage(data.firstMessage || '');
      setEndCallMessage(data.endCallMessage || '');
      setTemperature(data.model?.temperature || 0.7);
      setMaxTokens(data.model?.maxTokens || 250);
      setRecordingEnabled(data.recordingEnabled || false);
      setServerUrl(data.serverUrl || '');

      // Model settings
      setModelProvider(data.model?.provider || 'openai');
      setModelName(data.model?.model || 'gpt-4');

      // Voice settings
      setVoiceProvider(data.voice?.provider || '11labs');
      setVoiceId(data.voice?.voiceId || '');

      // Extract system prompt from model messages
      if (data.model?.messages && data.model.messages.length > 0) {
        const systemMessage = data.model.messages.find((m: any) => m.role === 'system');
        setSystemPrompt(systemMessage?.content || '');
      }

      // Extract tools and knowledge base from model
      if (data.model?.toolIds) {
        setSelectedToolIds(data.model.toolIds);
        console.log('🔧 Loaded toolIds:', data.model.toolIds);
      }
      if (data.model?.knowledgeBaseId) {
        setKnowledgeBaseId(data.model.knowledgeBaseId);
        console.log('📚 Loaded knowledgeBaseId:', data.model.knowledgeBaseId);
      }

      toast({
        title: "Assistant loaded",
        description: `Loaded ${data.name}`,
      });
    } catch (error) {
      console.error('❌ Failed to load assistant:', error);
      toast({
        title: "Failed to load assistant",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!assistant) return;

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

      // If files are selected, create a query tool for them
      let finalToolIds = [...selectedToolIds];
      if (selectedFileIds.length > 0) {
        console.log('📁 Creating query tool for selected files:', selectedFileIds);

        const queryTool = await client.createTool({
          type: 'function',
          function: {
            name: 'query_knowledge',
            description: 'Query the knowledge base files to answer questions based on uploaded documents',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The question or query to search for in the knowledge base'
                }
              },
              required: ['query']
            }
          },
          knowledgeBases: [
            {
              name: `${assistant.name} Knowledge Base`,
              provider: 'vapi',
              fileIds: selectedFileIds,
              description: 'Knowledge base containing uploaded documents'
            }
          ],
          metadata: {
            createdBy: 'voxhive-dashboard',
            fileIds: selectedFileIds,
            autoCreated: true
          }
        } as any);

        finalToolIds.push(queryTool.id);
        console.log('✅ Created query tool:', queryTool.id);
      }

      const updates = {
        name,
        firstMessage,
        endCallMessage,
        recordingEnabled,
        serverUrl: serverUrl || undefined,
        model: {
          provider: modelProvider,
          model: modelName,
          temperature,
          maxTokens,
          messages: [
            {
              role: 'system' as const,
              content: systemPrompt,
            }
          ],
          toolIds: finalToolIds.length > 0 ? finalToolIds : undefined,
          knowledgeBaseId: knowledgeBaseId || undefined,
        },
        voice: {
          provider: voiceProvider,
          voiceId: voiceId,
        }
      };

      console.log('💾 Saving updates:', updates);
      await client.updateAssistant(assistant.id, updates);

      toast({
        title: "Saved!",
        description: selectedFileIds.length > 0
          ? `Assistant updated with ${selectedFileIds.length} file(s) attached via query tool`
          : "Assistant updated successfully in Vapi",
      });

      // Reload to show updated data
      await loadAssistant();
    } catch (error) {
      console.error('❌ Failed to save:', error);
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleTestCall() {
    if (!assistant) return;

    try {
      setInitiatingCall(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      // Validate phone number if provided
      if (phoneNumber && !phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number with country code (e.g., +1234567890)",
          variant: "destructive",
        });
        return;
      }

      const callRequest: any = {
        assistantId: assistant.id,
      };

      // If phone number is provided, it's an outbound call
      if (phoneNumber) {
        callRequest.phoneNumber = phoneNumber;
      }

      console.log('📞 Initiating call:', callRequest);
      const call = await client.createCall(callRequest);

      setCurrentCall(call);
      toast({
        title: "Call initiated",
        description: phoneNumber
          ? `Calling ${phoneNumber}...`
          : "Web call started. Check Vapi dashboard for details.",
      });

      setCallDialogOpen(false);
      setPhoneNumber("");
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      toast({
        title: "Failed to initiate call",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setInitiatingCall(false);
    }
  }

  async function handleStartVoiceCall() {
    // Check if public key exists first
    const publicKey = getVapiPublicKey();
    if (!publicKey) {
      console.warn('⚠️ No public API key found, prompting user to add one');
      setPublicKeyDialogOpen(true);
      return;
    }

    if (!assistant || !vapiRef.current) {
      console.error('❌ Cannot start call: missing assistant or Vapi client');
      toast({
        title: "Cannot start call",
        description: "Assistant or Vapi client not initialized",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🎤 Starting voice call with assistant:', assistant.id);
      console.log('🎤 Assistant name:', assistant.name);
      console.log('🎤 Vapi client:', vapiRef.current);

      setCallStatus('Connecting...');
      setIsCallActive(true);

      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
      } catch (permError) {
        console.error('❌ Microphone permission denied:', permError);
        throw new Error('Microphone permission denied. Please allow microphone access to use voice calls.');
      }

      // Start the call with the assistant ID
      console.log('🎤 Calling vapi.start() with assistantId:', assistant.id);

      const callResponse = await vapiRef.current.start(assistant.id);

      console.log('✅ Voice call started successfully, response:', callResponse);

      toast({
        title: "Voice call started",
        description: "You can now speak with your assistant",
      });
    } catch (error: any) {
      console.error('❌ Failed to start voice call:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause,
        toString: error?.toString?.()
      });

      setIsCallActive(false);
      setCallStatus('');

      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      // If still undefined, provide more context
      if (errorMessage === 'undefined' || !errorMessage) {
        errorMessage = 'Failed to initialize voice call. Please check console for details.';
      }

      toast({
        title: "Failed to start voice call",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  async function handleSavePublicKey() {
    if (!tempPublicKey.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a public API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingPublicKey(true);

      // Update the active connection with the public key
      await updatePublicKey(tempPublicKey.trim());

      // Initialize Vapi Web SDK with the new public key
      console.log('🔑 Initializing Vapi Web SDK with new public key');
      const vapi = new Vapi(tempPublicKey.trim());
      vapiRef.current = vapi;

      // Set up event listeners
      vapi.on('call-start', () => {
        console.log('📞 Call started');
        setIsCallActive(true);
        setCallStatus('Connected');
      });

      vapi.on('call-end', () => {
        console.log('📴 Call ended');
        setIsCallActive(false);
        setCallStatus('');
      });

      vapi.on('speech-start', () => {
        console.log('🗣️ Assistant speech started');
        setCallStatus('Assistant speaking...');
      });

      vapi.on('speech-end', () => {
        console.log('🤫 Assistant speech ended');
        setCallStatus('Listening...');
      });

      vapi.on('error', (error) => {
        console.error('❌ Vapi error:', error);
        setCallStatus(`Error: ${error.message}`);
        toast({
          title: "Call error",
          description: error.message,
          variant: "destructive",
        });
      });

      vapi.on('message', (message) => {
        console.log('💬 Vapi message:', message);
      });

      toast({
        title: "Public key saved",
        description: "You can now start voice calls",
      });

      setPublicKeyDialogOpen(false);
      setTempPublicKey('');

      // Auto-start the call after saving the key
      setTimeout(() => handleStartVoiceCall(), 500);
    } catch (error) {
      console.error('❌ Failed to save public key:', error);
      toast({
        title: "Failed to save public key",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSavingPublicKey(false);
    }
  }

  function handleEndVoiceCall() {
    if (!vapiRef.current) return;

    try {
      console.log('📴 Ending voice call');
      vapiRef.current.stop();
      setIsCallActive(false);
      setCallStatus('');

      toast({
        title: "Voice call ended",
        description: "Call has been disconnected",
      });
    } catch (error) {
      console.error('❌ Failed to end voice call:', error);
      toast({
        title: "Failed to end call",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading assistant...</div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Assistants
        </Button>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Assistant not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback>
                {(assistant.name || 'UN').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{assistant.name || 'Unnamed Assistant'}</h1>
              <p className="text-sm text-muted-foreground font-mono">{assistant.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowRawJson(!showRawJson)}>
            <Code className="w-4 h-4 mr-2" />
            {showRawJson ? 'Hide' : 'Show'} Raw JSON
          </Button>
          <Button variant="outline" onClick={() => setCallDialogOpen(true)}>
            <Phone className="w-4 h-4 mr-2" />
            Test Call
          </Button>
          <Button variant="default" onClick={() => {
            console.log('🧪 Live Test button clicked, opening tester...');
            setLiveTesterOpen(true);
          }}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Live Test
          </Button>
          <Badge variant="default">Active</Badge>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Raw JSON View */}
      {showRawJson && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Vapi Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(assistant, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="transcriber">Transcriber</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="tools">Tools & Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label>First Message</Label>
                <Textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>End Call Message</Label>
                <Input
                  value={endCallMessage}
                  onChange={(e) => setEndCallMessage(e.target.value)}
                  placeholder="Message when call ends"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Select value={modelProvider} onValueChange={setModelProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {modelProviders.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model</Label>
                <Select value={modelName} onValueChange={setModelName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {(modelsByProvider[modelProvider] || []).map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div>
                <Label>All Messages (Read-only)</Label>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(assistant.model?.messages, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {voiceProviders.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {(voicesByProvider[voiceProvider] || []).map(voice => (
                      <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Voice ID (Custom)</Label>
                <Input
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="Or enter custom voice ID"
                />
              </div>
              <div>
                <Label>Full Voice Config (Read-only)</Label>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(assistant.voice, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcriber" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcriber Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Input value={assistant.transcriber?.provider || 'N/A'} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Model</Label>
                <Input value={assistant.transcriber?.model || 'N/A'} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Language</Label>
                <Input value={assistant.transcriber?.language || 'N/A'} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Organization ID</Label>
                <Input value={assistant.orgId} disabled className="bg-muted font-mono" />
              </div>
              <div>
                <Label>Recording Enabled</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recordingEnabled}
                    onChange={(e) => setRecordingEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{recordingEnabled ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div>
                <Label>Server URL (Webhook)</Label>
                <Input
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                />
              </div>
              <div>
                <Label>Created At</Label>
                <Input value={new Date(assistant.createdAt).toLocaleString()} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Updated At</Label>
                <Input value={new Date(assistant.updatedAt).toLocaleString()} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Metadata (Read-only)</Label>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(assistant.metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tools & Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Available Tools</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select tools to enable for this assistant
                </p>
                {availableTools.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                    No tools available. Create tools in the Tools section.
                  </div>
                ) : (
                  <div className="space-y-2 border rounded-lg p-4">
                    {availableTools.map((tool) => (
                      <div key={tool.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`tool-${tool.id}`}
                          checked={selectedToolIds.includes(tool.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedToolIds([...selectedToolIds, tool.id]);
                            } else {
                              setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`tool-${tool.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{tool.name || tool.id}</span>
                          {tool.description && (
                            <span className="text-muted-foreground ml-2">- {tool.description}</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold">Selected Tools</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Currently selected: {selectedToolIds.length} tool(s)
                </p>
                {selectedToolIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedToolIds.map((toolId) => {
                      const tool = availableTools.find(t => t.id === toolId);
                      return (
                        <Badge key={toolId} variant="secondary">
                          {tool?.name || toolId}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No tools selected</div>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold">Knowledge Base</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select a knowledge base to provide context to the assistant
                </p>
                {availableKnowledgeBases.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                    No knowledge bases available. You can attach individual files below instead.
                  </div>
                ) : (
                  <Select value={knowledgeBaseId} onValueChange={setKnowledgeBaseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a knowledge base (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="">None</SelectItem>
                      {availableKnowledgeBases.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name || kb.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {knowledgeBaseId && (
                <div>
                  <Label>Selected Knowledge Base</Label>
                  <Badge variant="secondary" className="mt-2">
                    {availableKnowledgeBases.find(kb => kb.id === knowledgeBaseId)?.name || knowledgeBaseId}
                  </Badge>
                </div>
              )}

              {/* Direct File Attachment Section */}
              <div className="pt-4 border-t">
                <Label className="text-base font-semibold">Or Attach Individual Files</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select files to attach directly to this assistant without creating a knowledge base
                </p>
                {availableFiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                    No files available. Upload files in the Knowledge section first.
                  </div>
                ) : (
                  <div className="space-y-2 border rounded-lg p-4 max-h-64 overflow-y-auto">
                    {availableFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`file-${file.id}`}
                          checked={selectedFileIds.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFileIds([...selectedFileIds, file.id]);
                            } else {
                              setSelectedFileIds(selectedFileIds.filter(id => id !== file.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`file-${file.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFileIds.length > 0 && (
                <div>
                  <Label>Selected Files</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedFileIds.length} file(s) will be attached via query tool
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFileIds.map((fileId) => {
                      const file = availableFiles.find(f => f.id === fileId);
                      return (
                        <Badge key={fileId} variant="secondary">
                          {file?.name || fileId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Call Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Call Agent</DialogTitle>
            <DialogDescription>
              Initiate a test call to your assistant. Leave phone number blank for a web call.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                type="tel"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to start a web call. Include country code for phone calls.
              </p>
            </div>

            {currentCall && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Current Call Status</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {currentCall.status}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Call ID:</span>{" "}
                    <span className="font-mono text-xs">{currentCall.id}</span>
                  </p>
                  {currentCall.type && (
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {currentCall.type}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCallDialogOpen(false);
                setPhoneNumber("");
              }}
              disabled={initiatingCall}
            >
              Cancel
            </Button>
            <Button onClick={handleTestCall} disabled={initiatingCall}>
              <Phone className="w-4 h-4 mr-2" />
              {initiatingCall ? "Calling..." : "Start Call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Public Key Setup Dialog */}
      <Dialog open={publicKeyDialogOpen} onOpenChange={setPublicKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public API Key Required</DialogTitle>
            <DialogDescription>
              To enable voice calls, please enter your Vapi public API key. This key is safe for client-side use and is different from your private API key.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="publicKey">Public API Key</Label>
              <Input
                id="publicKey"
                type="password"
                value={tempPublicKey}
                onChange={(e) => setTempPublicKey(e.target.value)}
                placeholder="Enter your public API key"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can find your public API key in your Vapi dashboard under Settings → API Keys.
                Public keys start with "pk_" and are safe to use in the browser.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPublicKeyDialogOpen(false);
                setTempPublicKey('');
              }}
              disabled={savingPublicKey}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePublicKey} disabled={savingPublicKey || !tempPublicKey.trim()}>
              {savingPublicKey ? "Saving..." : "Save & Start Call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Agent Tester */}
      {liveTesterOpen && (
        <LiveAgentTester
          assistantId={assistant.id}
          assistantName={assistant.name}
          onClose={() => setLiveTesterOpen(false)}
        />
      )}
    </div>
  );
}

