"use client";

import { motion } from "framer-motion";
import { PackageOpen, Search, BookmarkX, TrendingDown } from "lucide-react";

type EmptyType = "default" | "watchlist" | "portfolio" | "search" | "no-data";

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

const EMPTY_CONFIG: Record<
  EmptyType,
  { icon: React.ElementType; defaultTitle: string; defaultMessage: string }
> = {
  default: {
    icon: PackageOpen,
    defaultTitle: "Nothing here yet",
    defaultMessage: "There's no data to display right now.",
  },
  watchlist: {
    icon: BookmarkX,
    defaultTitle: "Watchlist is empty",
    defaultMessage: "Track your favourite stocks by adding them to your watchlist from any stock detail page.",
  },
  portfolio: {
    icon: TrendingDown,
    defaultTitle: "No holdings yet",
    defaultMessage: "Start building your portfolio by buying your first asset using the Trade button on any stock page.",
  },
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultMessage: "Try adjusting your search query or browse by category.",
  },
  "no-data": {
    icon: TrendingDown,
    defaultTitle: "No market data",
    defaultMessage: "Real-time market data is unavailable at the moment. Try again shortly.",
  },
};

export function EmptyState({ type = "default", title, message, action }: EmptyStateProps) {
  const config = EMPTY_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4"
    >
      {/* Floating icon */}
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted/50"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Dashed border animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-dashed border-muted-foreground/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <Icon className="h-8 w-8 text-muted-foreground" />
      </motion.div>

      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-sm font-bold text-foreground">{title || config.defaultTitle}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message || config.defaultMessage}
        </p>
      </div>

      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
