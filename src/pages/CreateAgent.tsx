import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { VoiceChat } from '@/components/ui/voice-chat';
import { ArrowLeft, Waves, User, MessageSquare, Mail } from 'lucide-react';
import { LiveKitRoom, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, userProfile, loading, isAuthenticated } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [lkToken, setLkToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Check authentication and permissions
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/auth?redirect=/create-agent');
      return;
    }

    // Wait a bit longer for userProfile to load after authentication
    const checkAccess = () => {
      console.log('Checking access:', { 
        isAdmin, 
        isSuperAdmin, 
        userProfile: userProfile ? {
          is_admin: userProfile.is_admin,
          is_super_admin: userProfile.is_super_admin,
          email: userProfile.email
        } : null 
      });
      
      const hasAccess = isAdmin || isSuperAdmin || userProfile?.is_admin || userProfile?.is_super_admin;
      
      if (!hasAccess) {
        // Only set access denied if we have tried to load the profile
        // and it's been more than 2 seconds since authentication
        setAccessDenied(true);
      }
    };

    if (userProfile) {
      // Profile is loaded, check access immediately
      checkAccess();
    } else {
      // Profile not loaded yet, wait a bit then check
      const timer = setTimeout(checkAccess, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, isAdmin, isSuperAdmin, userProfile, navigate]);

  const handleStartVoiceSession = async () => {
    setIsConnecting(true);
    try {
      const room = `voxie-agent-${Date.now()}`;
      setRoomName(room);

      // Call our LiveKit token edge function
      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: { 
          room,
          agentName: 'voxie', // Voxie - the master agent
          identity: `creator-${Math.random().toString(36).slice(2, 8)}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get LiveKit token');
      }

      if (!data?.token || !data?.serverUrl) {
        throw new Error('No token or server URL received from LiveKit service');
      }

      setLkToken(data.token);
      setServerUrl(data.serverUrl);
      setShowVoiceInterface(true);
    } catch (error: any) {
      console.error('Error starting voice session:', error);
      toast({
        title: "Connection Error",
        description: error.message || 'Failed to start voice session',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndSession = () => {
    setShowVoiceInterface(false);
    setLkToken(null);
    setServerUrl(null);
    setRoomName(null);
  };

  if (loading || (!userProfile && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-8">
            Creating voice agents requires special permissions. Please contact support to request access to the agent creation system.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.open('mailto:team@voiceagents.directory', '_blank')} 
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="p-2 rounded-lg gradient-primary">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Create Voice Agent
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!showVoiceInterface ? (
          // Welcome Screen
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <div className="w-24 h-24 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Meet <span className="text-primary">Voxie</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                VoxHive's ultra-sophisticated master agent will guide you through creating your perfect voice AI agent. 
                Just speak naturally, and Voxie will handle the rest.
              </p>
            </div>

            <div className="bg-card/50 rounded-2xl p-8 mb-8 border border-border/40">
              <h2 className="text-2xl font-semibold text-foreground mb-4">How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">1. Start Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Start with Voxie" to begin your voice session
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">2. Describe Your Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell Voxie about your desired agent's personality, voice, and purpose
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mb-3">
                    <Waves className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">3. Test & Deploy</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your agent, make adjustments, and deploy to the directory
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartVoiceSession}
              disabled={isConnecting}
              size="lg"
              className="text-lg px-8 py-6 gradient-primary text-white hover:bg-primary/90"
            >
              {isConnecting ? 'Connecting to Voxie...' : 'Start with Voxie'}
            </Button>
          </div>
        ) : (
          // Voice Interface
          <div className="relative">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                You're now speaking with <span className="text-primary">Voxie</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Tell me about the voice agent you'd like to create
              </p>
            </div>

            {lkToken && serverUrl && (
              <LiveKitRoom
                token={lkToken}
                serverUrl={serverUrl}
                connect
                audio
                className="lk-room"
                style={{ display: 'none' }}
              >
                <RoomAudioRenderer />
              </LiveKitRoom>
            )}

            <VoiceChat
              onStart={() => console.log('Voice input started')}
              onStop={(duration) => console.log('Voice input stopped, duration:', duration)}
              demoMode={false}
              className="min-h-[60vh]"
            />

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                onClick={handleEndSession}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm hover:bg-secondary/80"
              >
                End Session
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};