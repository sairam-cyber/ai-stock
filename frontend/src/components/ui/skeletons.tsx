"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Card Skeleton ────────────────────────────────────────────────────────────
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="shimmer h-8 w-8 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="shimmer h-3 w-28 rounded-full" />
          <div className="shimmer h-2.5 w-16 rounded-full" />
        </div>
        <div className="shimmer h-5 w-12 rounded-full" />
      </div>
      <div className="shimmer h-px w-full" />
      <div className="space-y-2">
        <div className="shimmer h-3 w-full rounded-full" />
        <div className="shimmer h-3 w-4/5 rounded-full" />
        <div className="shimmer h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="shimmer h-4 w-36 rounded-full" />
          <div className="shimmer h-2.5 w-24 rounded-full" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="shimmer h-6 w-8 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Chart bars */}
      <div className="h-[300px] flex items-end gap-1.5 px-2">
        {Array.from({ length: 40 }).map((_, i) => {
          const heights = [45, 60, 38, 72, 55, 80, 62, 48, 70, 58, 65, 50, 75, 42, 68,
                           55, 72, 60, 48, 65, 78, 52, 68, 45, 73, 60, 50, 65, 70, 55,
                           62, 48, 75, 58, 42, 70, 55, 65, 50, 60];
          return (
            <motion.div
              key={i}
              className="shimmer flex-1 rounded-t-sm"
              style={{ height: `${heights[i] ?? 55}%` }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 rounded-xl border border-border/40 p-3"
        >
          <div className="shimmer h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="shimmer h-3 w-24 rounded-full" />
            <div className="shimmer h-2 w-16 rounded-full" />
          </div>
          <div className="shimmer h-3 w-16 rounded-full" />
          <div className="shimmer h-6 w-12 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Stats Grid Skeleton ──────────────────────────────────────────────────────
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl border border-border bg-card p-4 space-y-2"
        >
          <div className="shimmer h-2.5 w-20 rounded-full" />
          <div className="shimmer h-6 w-28 rounded-full" />
          <div className="shimmer h-2 w-14 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Inline Spinner ───────────────────────────────────────────────────────────
export function InlineSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative h-10 w-10">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          style={{ borderTopColor: "var(--primary)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-primary/10"
          style={{ borderBottomColor: "var(--aurora-2)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {label && (
        <motion.span
          className="text-xs text-muted-foreground font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
