"use client";

import { motion } from "framer-motion";
import {
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const trending = [
  { symbol: "NVDA", name: "NVIDIA", price: 875.63, change: 4.21, reason: "AI chip demand surge", volume: "55.3M", aiScore: 95 },
  { symbol: "SMCI", name: "Super Micro", price: 824.19, change: 7.82, reason: "Data center growth", volume: "12.4M", aiScore: 88 },
  { symbol: "ARM", name: "ARM Holdings", price: 162.45, change: 3.56, reason: "Mobile AI expansion", volume: "8.9M", aiScore: 82 },
  { symbol: "PLTR", name: "Palantir", price: 24.87, change: -2.13, reason: "Earnings miss", volume: "42.1M", aiScore: 45 },
];

export function TrendingStocks() {
  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Trending
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            AI-curated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {trending.map((stock, i) => (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            {/* Rank */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
              #{i + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{stock.symbol}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {stock.name}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stock.reason}
              </p>
            </div>

            {/* AI Score */}
            <div className="text-center shrink-0">
              <div
                className={`text-xs font-bold ${
                  stock.aiScore >= 80
                    ? "text-stock-up"
                    : stock.aiScore >= 60
                      ? "text-primary"
                      : "text-stock-down"
                }`}
              >
                {stock.aiScore}
              </div>
              <div className="text-[9px] text-muted-foreground">AI Score</div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <p className="text-sm font-medium">${stock.price.toFixed(2)}</p>
              <div className="flex items-center justify-end gap-0.5">
                {stock.change >= 0 ? (
                  <ArrowUpRight className="h-2.5 w-2.5 text-stock-up" />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5 text-stock-down" />
                )}
                <span
                  className={`text-[10px] font-medium ${
                    stock.change >= 0 ? "text-stock-up" : "text-stock-down"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
