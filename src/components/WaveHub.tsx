import { motion } from "framer-motion";

interface WaveHubProps {
  audioLevel: number;
  state?: string;
}

export const WaveHub: React.FC<WaveHubProps> = ({ audioLevel, state }) => {
  const isAgentSpeaking = state === "speaking";
  const isAgentThinking = state === "thinking";
  const isListening = state === "listening";

  // Calculate wave intensity based on audio when speaking
  const waveIntensity = isAgentSpeaking ? audioLevel : 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ maxWidth: "600px", maxHeight: "600px" }}
      >
        <defs>
          {/* Gentle greyish-purple gradient */}
          <radialGradient id="wave-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6B7280" stopOpacity="0.2" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="wave-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central hub - always visible */}
        <motion.circle
          cx="200"
          cy="200"
          r="30"
          fill="url(#wave-gradient)"
          filter="url(#wave-glow)"
          animate={{
            scale: isAgentThinking ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isAgentThinking ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "center",
            transformBox: "fill-box",
          }}
        />

        {/* Wave rings when agent speaking - pulse outward - SUBTLE */}
        {isAgentSpeaking && audioLevel > 0.01 && (
          <>
            {[1, 2, 3].map((ring, index) => (
              <motion.circle
                key={`wave-ring-${ring}`}
                cx="200"
                cy="200"
                r="30"
                fill="none"
                stroke="url(#wave-gradient)"
                strokeWidth="2"
                initial={{ r: 30, opacity: 0.5 }}
                animate={{
                  r: 30 + (waveIntensity * 60 * ring), // Reduced from 150 to 60
                  opacity: [0.5, 0.2, 0], // Reduced from 0.8 to 0.5
                }}
                transition={{
                  duration: 2 + (index * 0.5), // Slower - increased from 1.5 to 2
                  repeat: Infinity,
                  delay: index * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Gentle flowing waves when thinking - SUBTLE */}
        {isAgentThinking && (
          <>
            {[1, 2].map((ring) => (
              <motion.circle
                key={`thinking-ring-${ring}`}
                cx="200"
                cy="200"
                r="30"
                fill="none"
                stroke="url(#wave-gradient)"
                strokeWidth="1.5"
                opacity="0.25"
                animate={{
                  r: [30 + (ring * 15), 30 + (ring * 18), 30 + (ring * 15)], // Reduced movement
                  opacity: [0.25, 0.35, 0.25], // Reduced from 0.3-0.5 to 0.25-0.35
                }}
                transition={{
                  duration: 4, // Slower - increased from 3 to 4
                  repeat: Infinity,
                  delay: ring * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}

        {/* Static rings when listening - no animation */}
        {isListening && (
          <>
            {[1, 2].map((ring) => (
              <circle
                key={`listening-ring-${ring}`}
                cx="200"
                cy="200"
                r={30 + (ring * 15)}
                fill="none"
                stroke="url(#wave-gradient)"
                strokeWidth="1"
                opacity="0.2"
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
};
