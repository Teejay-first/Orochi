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
import { VoiceChat } from "@/components/ui/voice-chat";
import VoiceAgent from "@/components/VoiceAgent";
import { LiveKitRoom } from '@livekit/components-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SessionRating } from '@/components/SessionRating';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [liveKitRoom] = useState(`agent-${Date.now()}`);
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
      
      setConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversationStatus = async (status: 'active' | 'completed' | 'ended') => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          status,
          ended_at: status !== 'active' ? new Date().toISOString() : null
        })
        .eq('id', conversationId);

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

      // Check if this is the master agent - use LiveKit
      const isMasterAgent = agent.id === 'master-agent-aristocratic';
      
      if (isMasterAgent) {
        // For master agent, just set status - VoiceAgent component handles connection
        setSessionStatus('connecting');
        return;
      }

      // For other agents, use RealtimeChat (OpenAI Realtime API)
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

  const isMasterAgent = agent?.id === 'master-agent-aristocratic';

  // If this is the master agent, show special UI
  if (isMasterAgent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <h1 className="text-2xl font-medium text-foreground">
                You're now speaking with{' '}
                <span className="text-primary font-semibold">Voxie</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                Master Agent Creator - VoxHive.ai Connection
              </p>
            </div>
          </div>
        </div>

        {/* Voice Interface */}
        <div className="flex-1 flex items-center justify-center">
          <VoiceAgent 
            room={liveKitRoom} 
            identity={user?.id || `user-${Date.now()}`} 
            agentName="aristocratic_master_agent"
            onStatusChange={(status) => setSessionStatus(status as any)}
            onConversationStart={() => {
              setConversationStarted(true);
              createConversationRecord();
            }}
            onConversationEnd={() => {
              setConversationStarted(false);
              handleEndSession();
            }}
          />
        </div>

        {/* Bottom Controls - Show end session if needed */}
        {sessionStatus === 'connected' && (
          <div className="border-t border-border/20 p-6">
            <div className="flex justify-center">
              <Button 
                onClick={handleEndSession} 
                variant="destructive" 
                size="lg"
                className="px-8"
              >
                End Session
              </Button>
            </div>
          </div>
        )}

        {/* Session Rating */}
        {sessionStatus === 'ended' && conversationId && (
          <div className="border-t border-border/20 p-6">
            <div className="flex justify-center">
              <SessionRating 
                agentId={agent?.id || ''} 
                sessionId={conversationId}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/20">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground">
              You're now speaking with{' '}
              <span className="text-primary font-semibold">{agent?.name}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {agent?.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Main Voice Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Status Message */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-lg">
            {sessionStatus === 'idle' && 'Ready to start your voice session'}
            {sessionStatus === 'connecting' && 'Connecting to voice agent...'}
            {sessionStatus === 'connected' && `${agent?.name} is listening and ready to help you`}
            {sessionStatus === 'ended' && 'Voice session has ended'}
          </p>
        </div>

        {/* Central Microphone */}
        <div className="relative mb-16">
          {sessionStatus === 'idle' && (
            <Button 
              onClick={handleStartSession} 
              size="lg" 
              className="w-24 h-24 rounded-full bg-primary hover:bg-primary-glow shadow-glow transition-all duration-300 hover:scale-105"
            >
              <Mic className="w-8 h-8" />
            </Button>
          )}
          
          {sessionStatus === 'connecting' && (
            <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center animate-pulse">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          
          {sessionStatus === 'connected' && (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
              isMuted 
                ? 'bg-destructive/20 border-destructive shadow-lg' 
                : 'bg-primary/20 border-primary shadow-accent animate-pulse-slow'
            }`}>
              <Mic 
                className={`w-12 h-12 transition-colors duration-300 ${
                  isMuted ? 'text-destructive' : 'text-primary'
                }`} 
              />
            </div>
          )}
          
          {sessionStatus === 'ended' && (
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-border flex items-center justify-center">
              <MicOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            sessionStatus === 'connected' 
              ? 'bg-success/20 text-success border border-success/30' 
              : sessionStatus === 'connecting'
              ? 'bg-warning/20 text-warning border border-warning/30'
              : 'bg-muted text-muted-foreground border border-border'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              sessionStatus === 'connected' 
                ? 'bg-success animate-pulse' 
                : sessionStatus === 'connecting'
                ? 'bg-warning animate-pulse'
                : 'bg-muted-foreground'
            }`} />
            <span className="text-sm font-medium capitalize">{sessionStatus}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-border/20 p-6">
        <div className="flex items-center justify-center gap-6">
          {sessionStatus === 'connected' && (
            <>
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                onClick={handleMicToggle}
                className="flex flex-col items-center gap-2 h-auto py-3 px-6"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-xs">Microphone</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                disabled
                className="flex flex-col items-center gap-2 h-auto py-3 px-6 opacity-50"
              >
                <div className="w-5 h-5 border-2 border-current rounded" />
                <span className="text-xs">Camera</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                disabled
                className="flex flex-col items-center gap-2 h-auto py-3 px-6 opacity-50"
              >
                <div className="w-5 h-5 border-2 border-current rounded flex items-center justify-center">
                  <div className="w-2 h-2 border border-current" />
                </div>
                <span className="text-xs">Share screen</span>
              </Button>
              
              <Button
                variant={isDeafened ? "destructive" : "outline"}
                size="lg"
                onClick={handleSpeakerToggle}
                className="flex flex-col items-center gap-2 h-auto py-3 px-6"
              >
                {isDeafened ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="text-xs">Leave</span>
              </Button>
            </>
          )}
        </div>
        
        {sessionStatus === 'connected' && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleEndSession} 
              variant="destructive" 
              size="lg"
              className="px-8"
            >
              End Session
            </Button>
          </div>
        )}
        
        {sessionStatus === 'ended' && (
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate('/')} size="lg" className="px-8">
              Return Home
            </Button>
            <SessionRating 
              agentId={agent?.id || ''} 
              sessionId={conversationIdRef.current || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};
