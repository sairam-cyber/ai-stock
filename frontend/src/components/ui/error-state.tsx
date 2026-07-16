"use client";

import { motion } from "framer-motion";
import { WifiOff, ServerCrash, RefreshCw, AlertTriangle, ShieldAlert, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorType = "server" | "network" | "not-found" | "forbidden" | "generic";

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ERROR_CONFIG: Record<
  ErrorType,
  { icon: React.ElementType; color: string; defaultTitle: string; defaultMessage: string; particleColor: string }
> = {
  server: {
    icon: ServerCrash,
    color: "text-stock-down",
    defaultTitle: "Server Error",
    defaultMessage: "The server encountered an unexpected error. This is usually temporary — please try again.",
    particleColor: "bg-stock-down",
  },
  network: {
    icon: WifiOff,
    color: "text-amber-500",
    defaultTitle: "Connection Lost",
    defaultMessage: "We couldn't reach the server. Check your internet connection and try again.",
    particleColor: "bg-amber-500",
  },
  "not-found": {
    icon: Frown,
    color: "text-muted-foreground",
    defaultTitle: "Not Found",
    defaultMessage: "The resource you are looking for does not exist or has been moved.",
    particleColor: "bg-muted-foreground",
  },
  forbidden: {
    icon: ShieldAlert,
    color: "text-orange-500",
    defaultTitle: "Access Denied",
    defaultMessage: "You don't have permission to view this resource.",
    particleColor: "bg-orange-500",
  },
  generic: {
    icon: AlertTriangle,
    color: "text-primary",
    defaultTitle: "Something went wrong",
    defaultMessage: "An unexpected error occurred. Please try refreshing the page.",
    particleColor: "bg-primary",
  },
};

export function ErrorState({
  type = "generic",
  title,
  message,
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[320px] px-6 py-12 text-center"
    >
      {/* Animated icon container */}
      <div className="relative mb-6">
        {/* Shockwave rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute inset-0 rounded-full border ${config.color.replace("text-", "border-")}/30`}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.5 + i * 0.8, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Icon bubble */}
        <motion.div
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border bg-background shadow-xl`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Icon className={`h-9 w-9 ${config.color}`} />
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 max-w-sm"
      >
        <h3 className="text-base font-bold text-foreground">{title || config.defaultTitle}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message || config.defaultMessage}
        </p>
      </motion.div>

      {/* Retry button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 h-9 px-5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
