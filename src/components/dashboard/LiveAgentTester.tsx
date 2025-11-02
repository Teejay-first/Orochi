import { useState, useEffect, useRef } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2, X } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
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

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LiveAgentTesterProps {
  assistantId: string;
  assistantName: string;
  onClose: () => void;
}

export function LiveAgentTester({ assistantId, assistantName, onClose }: LiveAgentTesterProps) {
  console.log('🎬 LiveAgentTester RENDERED with:', { assistantId, assistantName });

  const { getVapiPublicKey, updatePublicKey } = useProvider();

  const vapiRef = useRef<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('Ready');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const callStartTimeRef = useRef<number | null>(null);

  // Public key setup dialog
  const [publicKeyDialogOpen, setPublicKeyDialogOpen] = useState(false);
  const [tempPublicKey, setTempPublicKey] = useState('');
  const [savingPublicKey, setSavingPublicKey] = useState(false);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Initialize Vapi Web SDK
  useEffect(() => {
    const publicKey = getVapiPublicKey();

    if (publicKey) {
      try {
        console.log('🔑 Initializing Vapi Web SDK for Live Tester');
        const vapi = new Vapi(publicKey);
        vapiRef.current = vapi;

        // Set up event listeners
        vapi.on('call-start', () => {
          console.log('📞 Call started');
          setIsCallActive(true);
          setCallStatus('Connected');
          callStartTimeRef.current = Date.now();
          addMessage('system', 'Call started');
        });

        vapi.on('call-end', () => {
          console.log('📴 Call ended');
          setIsCallActive(false);
          setCallStatus('Call ended');
          callStartTimeRef.current = null;
          setCallDuration(0);
          addMessage('system', 'Call ended');
        });

        vapi.on('speech-start', () => {
          console.log('🗣️ Assistant speech started');
          setIsSpeaking(true);
          setCallStatus('Assistant speaking...');
        });

        vapi.on('speech-end', () => {
          console.log('🤫 Assistant speech ended');
          setIsSpeaking(false);
          setCallStatus('Listening...');
        });

        vapi.on('message', (message: any) => {
          console.log('💬 Vapi message:', message);

          // Handle different message types
          if (message.type === 'transcript') {
            if (message.transcriptType === 'final') {
              const role = message.role === 'assistant' ? 'assistant' : 'user';
              addMessage(role, message.transcript);
            }
          } else if (message.type === 'function-call') {
            addMessage('system', `Function called: ${message.functionCall.name}`);
          } else if (message.type === 'conversation-update') {
            // Handle conversation updates
            console.log('Conversation update:', message);
          }
        });

        vapi.on('error', (error: any) => {
          console.error('❌ Vapi error:', error);
          setCallStatus(`Error: ${error.message || 'Unknown error'}`);
          addMessage('system', `Error: ${error.message || 'Unknown error'}`);
          toast({
            title: "Call error",
            description: error.message || 'Unknown error',
            variant: "destructive",
          });
        });

        // Cleanup
        return () => {
          if (vapi) {
            console.log('🧹 Cleaning up Vapi Live Tester client');
            vapi.stop();
          }
        };
      } catch (error) {
        console.error('❌ Failed to initialize Vapi client:', error);
      }
    } else {
      console.warn('⚠️ No public API key available, prompting user');
      setPublicKeyDialogOpen(true);
    }
  }, []);

  function addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }

  async function handleStartCall() {
    const publicKey = getVapiPublicKey();
    if (!publicKey) {
      setPublicKeyDialogOpen(true);
      return;
    }

    if (!vapiRef.current) {
      toast({
        title: "Cannot start call",
        description: "Vapi client not initialized",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🎤 Starting live test call with assistant:', assistantId);
      setCallStatus('Connecting...');

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');

      // Start the call
      await vapiRef.current.start(assistantId);

      toast({
        title: "Call started",
        description: `Now speaking with ${assistantName}`,
      });
    } catch (error: any) {
      console.error('❌ Failed to start call:', error);
      setCallStatus('Error');

      const errorMessage = error?.message || 'Failed to start call';
      toast({
        title: "Failed to start call",
        description: errorMessage,
        variant: "destructive",
      });
      addMessage('system', `Failed to start call: ${errorMessage}`);
    }
  }

  function handleEndCall() {
    if (!vapiRef.current) return;

    try {
      console.log('📴 Ending live test call');
      vapiRef.current.stop();

      toast({
        title: "Call ended",
        description: "Conversation finished",
      });
    } catch (error) {
      console.error('❌ Failed to end call:', error);
    }
  }

  function toggleMute() {
    if (!vapiRef.current) return;

    try {
      if (isMuted) {
        // Note: Vapi Web SDK doesn't have a direct unmute method
        // This would need to be implemented via the SDK if available
        setIsMuted(false);
      } else {
        // Note: Vapi Web SDK doesn't have a direct mute method
        // This would need to be implemented via the SDK if available
        setIsMuted(true);
      }
    } catch (error) {
      console.error('❌ Failed to toggle mute:', error);
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

      await updatePublicKey(tempPublicKey.trim());

      // Initialize Vapi Web SDK with the new public key
      const vapi = new Vapi(tempPublicKey.trim());
      vapiRef.current = vapi;

      // Set up event listeners (same as in useEffect)
      vapi.on('call-start', () => {
        setIsCallActive(true);
        setCallStatus('Connected');
        callStartTimeRef.current = Date.now();
        addMessage('system', 'Call started');
      });

      vapi.on('call-end', () => {
        setIsCallActive(false);
        setCallStatus('Call ended');
        callStartTimeRef.current = null;
        setCallDuration(0);
        addMessage('system', 'Call ended');
      });

      vapi.on('speech-start', () => {
        setIsSpeaking(true);
        setCallStatus('Assistant speaking...');
      });

      vapi.on('speech-end', () => {
        setIsSpeaking(false);
        setCallStatus('Listening...');
      });

      vapi.on('message', (message: any) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          const role = message.role === 'assistant' ? 'assistant' : 'user';
          addMessage(role, message.transcript);
        }
      });

      vapi.on('error', (error: any) => {
        setCallStatus(`Error: ${error.message || 'Unknown error'}`);
        addMessage('system', `Error: ${error.message || 'Unknown error'}`);
      });

      toast({
        title: "Public key saved",
        description: "You can now start the call",
      });

      setPublicKeyDialogOpen(false);
      setTempPublicKey('');
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

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-semibold">Live Agent Testing</h2>
            <p className="text-sm text-muted-foreground">{assistantName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Bar */}
        <div className="px-4 pb-4 flex items-center gap-4">
          <Badge variant={isCallActive ? "default" : "secondary"} className={isCallActive ? "animate-pulse" : ""}>
            {callStatus}
          </Badge>

          {isCallActive && (
            <>
              <Badge variant="outline">
                {formatDuration(callDuration)}
              </Badge>

              {isSpeaking && (
                <Badge variant="secondary" className="gap-1">
                  <Volume2 className="w-3 h-3" />
                  Speaking
                </Badge>
              )}

              {isMuted && (
                <Badge variant="destructive" className="gap-1">
                  <MicOff className="w-3 h-3" />
                  Muted
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Transcript Panel */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Live Transcript</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a call to see the conversation transcript</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col gap-1 ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {message.role === 'user' ? 'You' : message.role === 'assistant' ? assistantName : 'System'}
                        </span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.role === 'assistant'
                            ? 'bg-muted'
                            : 'bg-accent text-accent-foreground text-xs'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Call Info Panel */}
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Assistant</p>
              <p className="text-sm text-muted-foreground">{assistantName}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <p className="text-sm text-muted-foreground">{callStatus}</p>
            </div>

            {isCallActive && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">Duration</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {formatDuration(callDuration)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Messages</p>
                  <p className="text-sm text-muted-foreground">
                    {messages.filter(m => m.role !== 'system').length} messages
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <div className="border-t bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-center gap-4">
          {!isCallActive ? (
            <Button
              size="lg"
              onClick={handleStartCall}
              className="gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              Start Call
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleMute}
                className="gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Mute
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Public Key Setup Dialog */}
      <Dialog open={publicKeyDialogOpen} onOpenChange={setPublicKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public API Key Required</DialogTitle>
            <DialogDescription>
              To enable voice calls, please enter your Vapi public API key.
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
                Find your public key in Vapi dashboard → Settings → API Keys
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPublicKeyDialogOpen(false);
                setTempPublicKey('');
                onClose();
              }}
              disabled={savingPublicKey}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePublicKey} disabled={savingPublicKey || !tempPublicKey.trim()}>
              {savingPublicKey ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
