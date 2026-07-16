"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({
  message = "Loading...",
  submessage = "Fetching real-time market data",
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* Aurora blobs */}
      <div className="aurora-bg">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Orbiting ring + icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            style={{ borderTopColor: "var(--primary)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Middle counter-rotating ring */}
          <motion.div
            className="absolute inset-3 rounded-full border border-primary/10"
            style={{ borderBottomColor: "var(--aurora-2)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner glow + Brain icon */}
          <motion.div
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="h-7 w-7 text-primary" />
          </motion.div>

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/70"
              style={{
                top: "50%",
                left: "50%",
                marginTop: -4,
                marginLeft: -4,
              }}
              animate={{
                x: Math.cos((i * 2 * Math.PI) / 3) * 46,
                y: Math.sin((i * 2 * Math.PI) / 3) * 46,
                rotate: 360,
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.25,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <motion.h2
            className="text-base font-bold text-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.h2>
          <motion.p
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {submessage}
          </motion.p>
        </div>

        {/* Animated progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
