"use client";

import { MarketOverview } from "@/components/dashboard/market-overview";
import { TrendingStocks } from "@/components/dashboard/trending-stocks";

export default function MarketsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Market Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track index benchmarks, real-time gainers, and trending assets.
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <MarketOverview />
        </div>
        <div>
          <TrendingStocks />
        </div>
      </div>
    </div>
  );
}
