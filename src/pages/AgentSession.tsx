import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Agent, SessionMessage, VoiceSession, VOICES } from '@/types/agent';
import { useAgents } from '@/contexts/AgentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'ended';

export const AgentSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agents, loading } = useAgents();
  const { user, isAuthenticated } = useAuth();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [latencyTarget, setLatencyTarget] = useState([200]);
  const [maxDuration, setMaxDuration] = useState([300]);
  // Removed push-to-talk functionality - keeping only hands-free mode
  
  const realtimeChatRef = useRef<RealtimeChat | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !id) return;
    
    const foundAgent = agents.find(a => a.id === id);
    if (foundAgent) {
      setAgent(foundAgent);
      setSelectedVoice(foundAgent.voice || 'alloy');
    } else {
      // Agent not found after loading is complete
      navigate('/');
      return;
    }
  }, [id, agents, loading, navigate]);

  useEffect(() => {
    if (!agent || loading) return;
    
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'system',
      content: `Ready to connect to ${agent.name}. Click "Start Session" to begin voice conversation.`,
      timestamp: Date.now(),
    }]);
    
    // Cleanup on unmount
    return () => {
      if (realtimeChatRef.current) {
        realtimeChatRef.current.disconnect();
      }
    };
  }, [agent, navigate]);

  const createConversationRecord = async () => {
    if (!user || !agent) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          agent_id: agent.id,
          status: 'active',
          transcript: []
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversationStatus = async (status: 'active' | 'completed' | 'ended') => {
    if (!conversationIdRef.current) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          status,
          ended_at: status !== 'active' ? new Date().toISOString() : null
        })
        .eq('id', conversationIdRef.current);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const handleStartSession = async () => {
    if (!agent) return;
    
    try {
      // Create conversation record
      const conversationId = await createConversationRecord();
      if (conversationId) {
        conversationIdRef.current = conversationId;
      }

      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Prepare instructions based on agent configuration
      let instructions = "You are a helpful assistant.";
      
      if (agent.prompt_source === 'text' && agent.prompt_text) {
        instructions = agent.prompt_text;
      } else if (agent.prompt_source === 'prompt_id' && agent.prompt_id) {
        instructions = `Use prompt ID: ${agent.prompt_id}. You are ${agent.name}, ${agent.tagline}`;
      }
      
      // Initialize realtime chat
      realtimeChatRef.current = new RealtimeChat(
        (message) => {
          setMessages(prev => {
            // Handle partial messages by updating the last message if it has the same ID
            if (message.isPartial) {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.id === message.id && lastMessage.isPartial) {
                return [...prev.slice(0, -1), message];
              }
            }
            return [...prev, message];
          });
        },
        setSessionStatus,
        agent.id,
        user?.id
      );
      
      await realtimeChatRef.current.init(selectedVoice, { 
        instructions, 
        promptId: agent.prompt_id, 
        model: agent.model || 'gpt-realtime-2025-08-28' 
      });

      // Start with hands-free mode enabled
      
      toast({
        title: "Connected",
        description: `Voice session with ${agent.name} started successfully`,
      });
      
    } catch (error) {
      console.error('Error starting session:', error);
      setSessionStatus('ended');
      
      toast({
        title: "Connection Failed", 
        description: error instanceof Error ? error.message : 'Failed to start voice session',
        variant: "destructive",
      });
    }
  };

  const handleEndSession = () => {
    if (realtimeChatRef.current) {
      realtimeChatRef.current.disconnect();
    }
    
    updateConversationStatus('ended');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content: 'Session ended. Thank you for using VoiceTube!',
      timestamp: Date.now(),
    }]);
  };

  const handleSendText = async () => {
    if (!textInput.trim() || !realtimeChatRef.current) return;
    
    try {
      await realtimeChatRef.current.sendTextMessage(textInput);
      setTextInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMicToggle = () => {
    if (!realtimeChatRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    realtimeChatRef.current.setMicMute(newMutedState);
  };

  const handleSpeakerToggle = () => {
    if (!realtimeChatRef.current) return;
    
    const newDeafenedState = !isDeafened;
    setIsDeafened(newDeafenedState);
    realtimeChatRef.current.setSpeakerMute(newDeafenedState);
  };

  // Removed push-to-talk functionality

  // Show loading state while agents are loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  // Show agent not found after loading is complete
  if (!loading && !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Agent Not Found</h2>
          <p className="text-muted-foreground mb-6">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Session Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-secondary-hover"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
              />
              <div>
                <h2 className="font-semibold">{agent.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {agent.category}
                  </Badge>
                  <div className={`voice-indicator ${sessionStatus === 'connected' ? 'active' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Call Panel */}
        <div className="flex-1 flex flex-col p-6">
          {/* Status and Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                {sessionStatus === 'idle' && (
                  <Button onClick={handleStartSession} size="lg" className="px-8">
                    <Phone className="w-5 h-5 mr-2" />
                    Start Session
                  </Button>
                )}
                
                {sessionStatus === 'connecting' && (
                  <Button disabled size="lg" className="px-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                    Connecting...
                  </Button>
                )}
                
                {sessionStatus === 'connected' && (
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      onClick={handleMicToggle}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant={isDeafened ? "destructive" : "outline"}
                      onClick={handleSpeakerToggle}
                    >
                      {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    
                    <Button onClick={handleEndSession} variant="destructive">
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Session
                    </Button>
                  </div>
                )}
                
                {sessionStatus === 'ended' && (
                  <Button onClick={() => navigate('/')} variant="outline">
                    Return Home
                  </Button>
                )}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Status: <span className="capitalize font-medium">{sessionStatus}</span>
              </div>
            </CardContent>
          </Card>

          {/* Chat Timeline */}
          <Card className="flex-1 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-96">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Text Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              disabled={sessionStatus !== 'connected'}
            />
            <Button 
              onClick={handleSendText}
              disabled={!textInput.trim() || sessionStatus !== 'connected'}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Push-to-talk functionality removed - using hands-free mode only */}

      {/* Sidebar */}
      <div className="w-80 border-l border-border/40 bg-card/30 p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Input value={agent.model || 'gpt-realtime-2025-08-28'} disabled />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Latency Target: {latencyTarget[0]}ms
              </label>
              <Slider
                value={latencyTarget}
                onValueChange={setLatencyTarget}
                max={1000}
                min={50}
                step={50}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Max Duration: {Math.floor(maxDuration[0] / 60)}m {maxDuration[0] % 60}s
              </label>
              <Slider
                value={maxDuration}
                onValueChange={setMaxDuration}
                max={1800}
                min={30}
                step={30}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agent Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{agent.tagline}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Language:</span>
                <span>{agent.language}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Prompt Source:</span>
                <span className="capitalize">{agent.prompt_source}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};