import "@livekit/components-styles";
import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
  useVoiceAssistant,
  ConnectionStateToast,
} from "@livekit/components-react";
import { DefaultReconnectPolicy } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";

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
  agentName = "aristocratic_master_agent",
  onStatusChange,
  onConversationStart,
  onConversationEnd,
}: VoiceAgentProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      onStatusChange?.("connecting");
      
      // Request microphone permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError) {
        console.error("Microphone permission denied:", permissionError);
        onStatusChange?.("error");
        return;
      }

      const { data, error } = await supabase.functions.invoke("livekit-token", {
        body: { room, identity, agentName },
      });
      if (error || !data?.token || !data?.serverUrl) {
        onStatusChange?.("error");
        console.error("token error", error ?? data);
        return;
      }
      setToken(data.token);
      setServerUrl(data.serverUrl);
    })();
  }, [room, identity, agentName, onStatusChange]);

  if (!token || !serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-sm opacity-70">connecting to voxhive.ai…</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      options={{
        reconnectPolicy: new DefaultReconnectPolicy([1000, 2000, 5000, 10000, 20000]),
      }}
      onConnected={() => {
        onConversationStart?.();
        onStatusChange?.("connected");
      }}
      onDisconnected={() => {
        // don't instantly end; allow auto-reconnect UI to handle it
        onStatusChange?.("reconnecting");
        // optional: if you want a hard end after prolonged failure, add a timeout here
        // setTimeout(() => onConversationEnd?.(), 30000);
      }}
    >
      <VoiceAgentUI />
      <RoomAudioRenderer />
      <VoiceAssistantControlBar />
      <ConnectionStateToast />
    </LiveKitRoom>
  );
}

function VoiceAgentUI() {
  const { state, audioTrack } = useVoiceAssistant();
  
  const getStateColor = (state: any) => {
    switch (state) {
      case "listening": return "text-green-500";
      case "thinking": return "text-blue-500";
      case "speaking": return "text-purple-500";
      default: return "text-muted-foreground";
    }
  };

  const getStateIcon = (state: any) => {
    switch (state) {
      case "listening": return "🎤";
      case "thinking": return "🤔";
      case "speaking": return "🗣️";
      default: return "💬";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <BarVisualizer state={state} trackRef={audioTrack} barCount={9} />
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStateIcon(state)}</span>
        <p className={`text-sm font-medium ${getStateColor(state)}`}>
          {!state || state === "disconnected" ? "Ready to chat" : `Agent is ${state}...`}
        </p>
      </div>
    </div>
  );
}