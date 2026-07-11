"use client";

import { motion } from "framer-motion";
import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const watchlistStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 198.45, change: 2.34, volume: "45.2M" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.72, change: -1.56, volume: "82.1M" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 176.89, change: 1.12, volume: "22.8M" },
  { symbol: "META", name: "Meta Platforms", price: 505.31, change: 3.45, volume: "18.5M" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.63, change: 4.21, volume: "55.3M" },
  { symbol: "AMZN", name: "Amazon.com", price: 185.47, change: 0.89, volume: "35.7M" },
];

export function WatchlistWidget() {
  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            Watchlist
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2 px-2 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Stock</span>
            <span className="text-right">Price</span>
            <span className="text-right">Change</span>
            <span className="text-right">Vol</span>
          </div>

          {/* Rows */}
          {watchlistStocks.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              className="grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {stock.symbol}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {stock.name}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-right">
                ${stock.price.toFixed(2)}
              </p>
              <div className="flex items-center justify-end gap-0.5">
                {stock.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-stock-up" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-stock-down" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stock.change >= 0 ? "text-stock-up" : "text-stock-down"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {stock.volume}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
