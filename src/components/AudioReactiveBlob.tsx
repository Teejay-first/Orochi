import { useEffect, useState, useRef } from "react";
import type { TrackReference } from "@livekit/components-core";
import { WaveHub } from "./WaveHub";

interface AudioReactiveBlobProps {
  audioTrack?: TrackReference;
  state?: string;
}

export const AudioReactiveBlob: React.FC<AudioReactiveBlobProps> = ({
  audioTrack,
  state = "default",
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number>();

  // 1. Connect Agent Audio & Measure Energy
  useEffect(() => {
    console.log("🎵 AudioReactiveBlob: audioTrack =", audioTrack, "state =", state);

    // Reset if no track reference
    if (!audioTrack || !audioTrack.publication) {
      console.warn("❌ No audio track publication available");
      setAudioLevel(0);
      return;
    }

    const track = audioTrack.publication.track;
    if (!track) {
      console.warn("❌ No actual track in publication");
      setAudioLevel(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let running = true;

    try {
      console.log("✅ Creating AudioContext...");
      console.log("🎤 Track object:", track);
      console.log("🎤 MediaStreamTrack:", track.mediaStreamTrack);

      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;

      const mediaStreamTrack = track.mediaStreamTrack;
      console.log("🎤 Track state:", mediaStreamTrack.readyState);
      console.log("🎤 Track enabled:", mediaStreamTrack.enabled);
      console.log("🎤 Track kind:", mediaStreamTrack.kind);

      const mediaStream = new MediaStream([mediaStreamTrack]);
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      console.log("🎵 Audio analysis setup complete, buffer length:", bufferLength);

      const updateAudioLevel = () => {
        if (!running || !analyser) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate RMS for better loudness detection
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);
        const normalized = Math.min(rms / 30, 1); // EVEN MORE sensitive (was 50)

        if (normalized > 0.01) {
          console.log("🔊 Audio detected! Level:", normalized.toFixed(3), "RMS:", rms.toFixed(1));
        }

        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
      console.log("🎵 Started audio level monitoring loop");
    } catch (err) {
      console.error("❌ AudioContext error:", err);
      setAudioLevel(0);
    }

    return () => {
      console.log("🛑 Cleaning up audio analysis");
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(console.error);
      }
    };
  }, [audioTrack]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Central Wave Hub - Only visualization */}
      <WaveHub audioLevel={audioLevel} state={state} />
    </div>
  );
};
