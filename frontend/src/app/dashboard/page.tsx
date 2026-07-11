"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { PortfolioWidget } from "@/components/dashboard/portfolio-widget";
import { AIInsightsPanel } from "@/components/dashboard/ai-insights";
import { WatchlistWidget } from "@/components/dashboard/watchlist-widget";
import { TrendingStocks } from "@/components/dashboard/trending-stocks";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()},{" "}
          <span className="gradient-text">{user?.name?.split(" ")[0] || "Investor"}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Here&apos;s what&apos;s happening in the markets today
        </p>
      </motion.div>

      {/* Market Overview Cards */}
      <MarketOverview />

      {/* Main Grid: Chart + Portfolio */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <PortfolioWidget />
        </div>
      </div>

      {/* Secondary Grid: Watchlist + AI Insights + Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <WatchlistWidget />
        </div>
        <div>
          <AIInsightsPanel />
        </div>
        <div>
          <TrendingStocks />
        </div>
      </div>
    </div>
  );
}
