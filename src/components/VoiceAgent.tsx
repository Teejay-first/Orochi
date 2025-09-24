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
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <BarVisualizer state={state} trackRef={audioTrack} barCount={9} />
      <p className="text-sm text-muted-foreground">assistant state: {state}</p>
    </div>
  );
}