"use client";

import { Mic, MicOff, Volume2, VolumeX, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConnectionState, useRemoteParticipants, useLocalParticipant } from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';

interface VoiceChatProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  demoMode?: boolean;
  conversationStarted?: boolean;
  sessionStatus?: 'idle' | 'connecting' | 'connected' | 'ended';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}

export function VoiceChat({
  onStart,
  onStop,
  onVolumeChange,
  className,
  demoMode = true,
  conversationStarted = false,
  sessionStatus = 'idle'
}: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0));
  const [conversationTimer, setConversationTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const conversationStartTime = useRef<number | null>(null);

  // Use sessionStatus for RealtimeChat or LiveKit state for demo
  const isRealtimeMode = !demoMode && sessionStatus !== undefined;
  
  // LiveKit hooks for real-time state (only when not using RealtimeChat)
  const connectionState = demoMode || isRealtimeMode ? ConnectionState.Connected : useConnectionState();
  const participants = demoMode || isRealtimeMode ? [] : useRemoteParticipants();
  const localParticipant = demoMode || isRealtimeMode ? null : useLocalParticipant();

  // Get agent participant (first remote participant)
  const agentParticipant = participants.length > 0 ? participants[0] : null;

  // Generate particles for ambient effect
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = window.innerWidth < 768 ? 10 : 20; // Fewer particles on mobile
      const maxSize = window.innerWidth < 768 ? 200 : 400; // Smaller area on mobile
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * maxSize,
          y: Math.random() * maxSize,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.2 + 0.05,
          velocity: {
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3
          }
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    
    // Regenerate particles on resize
    const handleResize = () => generateParticles();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      const maxSize = window.innerWidth < 768 ? 200 : 400;
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.velocity.x + maxSize) % maxSize,
        y: (particle.y + particle.velocity.y + maxSize) % maxSize,
        opacity: Math.max(0.05, Math.min(0.3, particle.opacity + (Math.random() - 0.5) * 0.01))
      })));
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Conversation timer - starts when conversation begins and runs continuously
  useEffect(() => {
    if (conversationStarted && !conversationStartTime.current) {
      conversationStartTime.current = Date.now();
    }

    if (conversationStarted) {
      const timer = setInterval(() => {
        if (conversationStartTime.current) {
          const elapsed = Math.floor((Date.now() - conversationStartTime.current) / 1000);
          setConversationTimer(elapsed);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [conversationStarted]);

  // State detection for RealtimeChat or LiveKit
  useEffect(() => {
    if (demoMode) return;

    if (isRealtimeMode) {
      // Use sessionStatus for RealtimeChat mode
      setIsListening(sessionStatus === 'connected');
      setIsProcessing(sessionStatus === 'connecting');
      setIsSpeaking(false); // This would be controlled by RealtimeChat callbacks
    } else {
      // LiveKit state detection
      if (agentParticipant) {
        const audioTrackPub = Array.from(agentParticipant.audioTrackPublications.values())[0];
        const agentSpeaking = audioTrackPub && !audioTrackPub.isMuted && audioTrackPub.isSubscribed;
        setIsSpeaking(agentSpeaking || false);
      }

      // Check if local user is speaking (has mic active)
      if (localParticipant && localParticipant.localParticipant) {
        const micTrack = localParticipant.localParticipant.getTrackPublication(Track.Source.Microphone);
        const userSpeaking = micTrack && !micTrack.isMuted;
        setIsListening(userSpeaking || false);
      }
    }
  }, [agentParticipant, localParticipant, demoMode, isRealtimeMode, sessionStatus]);

  // Waveform simulation and volume detection
  useEffect(() => {
    if (isListening || isSpeaking) {
      intervalRef.current = setInterval(() => {
        // Simulate audio waveform
        const newWaveform = Array(32).fill(0).map(() => 
          Math.random() * (isListening || isSpeaking ? 100 : 20)
        );
        setWaveformData(newWaveform);
        
        // Simulate volume changes
        const newVolume = Math.random() * 100;
        setVolume(newVolume);
        onVolumeChange?.(newVolume);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setWaveformData(Array(32).fill(0));
      setVolume(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isListening, isSpeaking, onVolumeChange]);

  // Demo mode simulation
  useEffect(() => {
    if (!demoMode) return;

    const demoSequence = async () => {
      // Start listening
      setIsListening(true);
      onStart?.();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stop listening and start processing
      setIsListening(false);
      setIsProcessing(true);
      onStop?.(duration);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start speaking response
      setIsProcessing(false);
      setIsSpeaking(true);
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Reset
      setIsSpeaking(false);
      setDuration(0);
      
      // Repeat demo
      setTimeout(demoSequence, 2000);
    };

    const timeout = setTimeout(demoSequence, 1000);
    return () => clearTimeout(timeout);
  }, [demoMode, onStart, onStop, duration]);

  const handleToggleListening = () => {
    if (demoMode) return;
    
    // In LiveKit mode, this is handled by the room connection
    // Just trigger callbacks
    if (isListening) {
      onStop?.(conversationTimer);
    } else {
      onStart?.();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (isRealtimeMode) {
      if (sessionStatus === 'connecting') return "Connecting to Voxie...";
      if (sessionStatus === 'connected') return "Voxie is listening...";
      if (sessionStatus === 'ended') return "Session ended";
      return "Ready to connect";
    }
    
    if (isListening) return "Listening...";
    if (isProcessing) return "Processing...";
    if (isSpeaking) return "Speaking...";
    return "Tap to speak";
  };

  const getStatusColor = () => {
    if (isListening) return "text-blue-400";
    if (isProcessing) return "text-yellow-400";
    if (isSpeaking) return "text-green-400";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[70vh] bg-background relative overflow-hidden px-4", className)}>
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity
            }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Background glow effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"
          animate={{
            scale: isListening ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: isListening ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-md">
        {/* Main voice button */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.button
            onClick={handleToggleListening}
            className={cn(
              "relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-gradient-to-br from-primary/20 to-primary/10 border-2",
              isListening ? "border-blue-500 shadow-lg shadow-blue-500/25" :
              isProcessing ? "border-yellow-500 shadow-lg shadow-yellow-500/25" :
              isSpeaking ? "border-green-500 shadow-lg shadow-green-500/25" :
              "border-border hover:border-primary/50"
            )}
            animate={{
              boxShadow: isListening 
                ? ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 20px rgba(59, 130, 246, 0)"]
                : undefined
            }}
            transition={{
              duration: 1.5,
              repeat: isListening ? Infinity : 0
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 animate-spin" />
                </motion.div>
              ) : isSpeaking ? (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Volume2 className="w-8 h-8 md:w-12 md:h-12 text-green-500" />
                </motion.div>
              ) : isListening ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-8 h-8 md:w-12 md:h-12 text-blue-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse rings */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/20"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Waveform visualizer */}
        <div className="flex items-center justify-center space-x-1 h-12 md:h-16">
          {waveformData.slice(0, window.innerWidth < 768 ? 16 : 32).map((height, index) => (
            <motion.div
              key={index}
              className={cn(
                "w-0.5 md:w-1 rounded-full transition-colors duration-300",
                isListening ? "bg-blue-500" :
                isProcessing ? "bg-yellow-500" :
                isSpeaking ? "bg-green-500" :
                "bg-muted"
              )}
              animate={{
                height: `${Math.max(4, height * 0.4)}px`,
                opacity: isListening || isSpeaking ? 1 : 0.3
              }}
              transition={{
                duration: 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Status and timer */}
        <div className="text-center space-y-2">
          <motion.p
            className={cn("text-base md:text-lg font-medium transition-colors", getStatusColor())}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{
              duration: 2,
              repeat: isListening || isProcessing || isSpeaking ? Infinity : 0
            }}
          >
            {getStatusText()}
          </motion.p>
          
          <p className="text-sm text-muted-foreground font-mono">
            {formatTime(conversationStarted ? conversationTimer : duration)}
          </p>

          {volume > 0 && (
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <div className="w-16 md:w-24 h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  animate={{ width: `${volume}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>

        {/* AI indicator */}
        <motion.div
          className="flex items-center space-x-2 text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm">AI Voice Assistant</span>
        </motion.div>
      </div>
    </div>
  );
}