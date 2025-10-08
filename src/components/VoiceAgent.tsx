import "@livekit/components-styles";
import { useEffect, useState, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  ConnectionStateToast,
} from "@livekit/components-react";
import { DefaultReconnectPolicy } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { AudioReactiveBlob } from "@/components/AudioReactiveBlob";
import { getRandomFunFact } from "@/data/funFacts";
import { motion, AnimatePresence } from "framer-motion";
import handoffSound from "@/assets/mixkit-magic-marimba-2820.wav";

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
  const [funFact, setFunFact] = useState(getRandomFunFact());
  const [showHandoffNotification, setShowHandoffNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedHandoff = useRef(false);
  const previousState = useRef<string>("");

  // Detect agent handoff: when state transitions from "initializing" to "listening"
  useEffect(() => {
    console.log(`🔄 Agent state transition: "${previousState.current}" → "${state}"`);

    if (
      previousState.current === "initializing" &&
      state === "listening" &&
      !hasPlayedHandoff.current
    ) {
      console.log("✅ AGENT HANDOFF DETECTED! Playing notification...");
      hasPlayedHandoff.current = true;

      // Show notification
      setShowHandoffNotification(true);

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(err =>
          console.warn("Could not play handoff sound:", err)
        );
      }

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowHandoffNotification(false);
      }, 3000);
    }

    // Update previous state for next comparison
    previousState.current = state;
  }, [state]);

  // Update fun fact every 5 seconds when thinking
  useEffect(() => {
    if (state === "thinking") {
      setFunFact(getRandomFunFact());

      const interval = setInterval(() => {
        setFunFact(getRandomFunFact());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [state]);

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
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      {/* Hidden audio element for handoff sound */}
      <audio ref={audioRef} src={handoffSound} preload="auto" />

      {/* Handoff Notification */}
      <AnimatePresence>
        {showHandoffNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-8 z-50 px-6 py-3 bg-green-500/20 border border-green-500/40 rounded-lg backdrop-blur-sm"
          >
            <p className="text-sm text-green-400 font-medium flex items-center gap-2">
              <span className="text-lg">✨</span>
              Agent is ready for handoff
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio-Reactive Morphing Blob - Main Visual */}
      <div className="w-full max-w-2xl h-96">
        <AudioReactiveBlob audioTrack={audioTrack} state={state} />
      </div>

      {/* State Display */}
      <div className="flex flex-col items-center gap-3 min-h-[60px]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStateIcon(state)}</span>
          <p className={`text-sm font-medium ${getStateColor(state)}`}>
            {!state || state === "disconnected" ? "Ready to chat" : `Agent is ${state}...`}
          </p>
        </div>

        {/* Fun Fact Display when Thinking */}
        {state === "thinking" && (
          <div className="mt-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg max-w-lg animate-pulse">
            <p className="text-xs text-blue-300 text-center italic">
              {funFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}