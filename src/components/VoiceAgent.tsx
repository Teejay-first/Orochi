import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
  useVoiceAssistant,
} from '@livekit/components-react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAgentProps {
  room: string;
  identity: string;
  agentName?: string;
  onStatusChange?: (status: string) => void;
  onConversationStart?: () => void;
  onConversationEnd?: () => void;
}

export default function VoiceAgent({ 
  room, 
  identity, 
  agentName = 'aristocratic_master_agent',
  onStatusChange,
  onConversationStart,
  onConversationEnd
}: VoiceAgentProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        onStatusChange?.('connecting');
        
        const { data, error } = await supabase.functions.invoke('livekit-token', {
          body: { 
            room, 
            identity, 
            agentName 
          }
        });

        if (error) {
          console.error('Error fetching token:', error);
          setError(error.message || 'Failed to get token');
          onStatusChange?.('error');
          return;
        }

        if (data?.token && data?.serverUrl) {
          setToken(data.token);
          setServerUrl(data.serverUrl);
          onStatusChange?.('connected');
        } else {
          setError('Invalid token response');
          onStatusChange?.('error');
        }
      } catch (err) {
        console.error('Token fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        onStatusChange?.('error');
      }
    };

    fetchToken();
  }, [room, identity, agentName, onStatusChange]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-destructive">
        <p className="text-sm">Connection failed: {error}</p>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-sm opacity-70">Connecting to VoxHive.ai...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom 
      serverUrl={serverUrl} 
      token={token} 
      connect
      onConnected={() => {
        onConversationStart?.();
        onStatusChange?.('connected');
      }}
      onDisconnected={() => {
        onConversationEnd?.();
        onStatusChange?.('ended');
      }}
    >
      <VoiceAgentUI />
      <RoomAudioRenderer />
      <VoiceAssistantControlBar />
    </LiveKitRoom>
  );
}

function VoiceAgentUI() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="relative">
        <BarVisualizer 
          state={state} 
          trackRef={audioTrack} 
          barCount={9}
          options={{
            minHeight: 20,
            maxHeight: 60,
          }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Assistant state: {state}
        </p>
      </div>
    </div>
  );
}