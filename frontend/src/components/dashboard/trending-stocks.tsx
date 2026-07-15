"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface TrendingItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  reason: string;
  volume: string;
  aiScore: number;
}

const initialTrending = [
  { symbol: "NVDA", name: "NVIDIA", price: 875.63, change: 4.21, reason: "AI chip demand surge", volume: "55.3M", aiScore: 95 },
  { symbol: "SMCI", name: "Super Micro", price: 824.19, change: 7.82, reason: "Data center growth", volume: "12.4M", aiScore: 88 },
  { symbol: "ARM", name: "ARM Holdings", price: 162.45, change: 3.56, reason: "Mobile AI expansion", volume: "8.9M", aiScore: 82 },
  { symbol: "PLTR", name: "Palantir", price: 24.87, change: -2.13, reason: "Enterprise AIP adoption", volume: "42.1M", aiScore: 78 },
];

export function TrendingStocks() {
  const router = useRouter();
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingLivePrices = async () => {
      setLoading(true);
      try {
        const promises = initialTrending.map(async (item) => {
          try {
            const { data } = await api.get(`/stocks/${item.symbol}/summary`);
            if (data.success && data.data) {
              return {
                ...item,
                price: data.data.price ?? item.price,
                change: data.data.change ?? item.change,
                volume: data.data.vol || item.volume,
              };
            }
          } catch (err) {
            console.error(`Failed to load trending stock live price for ${item.symbol}:`, err);
          }
          return item;
        });
        const results = await Promise.all(promises);
        setItems(results);
      } catch (err) {
        console.error("Failed to load trending data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingLivePrices();
  }, []);

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            Trending
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            AI-curated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Curating trending items...</span>
          </div>
        ) : (
          items.map((stock, i) => {
            const isPositive = stock.change >= 0;
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                onClick={() => router.push(`/dashboard/stocks/${stock.symbol}`)}
                className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent/30 transition-all cursor-pointer group"
              >
                {/* Rank */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  #{i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs group-hover:text-primary transition-colors">{stock.symbol}</span>
                    <span className="text-[9px] text-muted-foreground truncate">
                      {stock.name}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
                    {stock.reason}
                  </p>
                </div>

                {/* AI Score */}
                <div className="text-center shrink-0 pr-1">
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
                  <div className="text-[8px] text-muted-foreground">AI Score</div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">${(stock.price ?? 0).toFixed(2)}</p>
                  <div className="flex items-center justify-end gap-0.5">
                    {isPositive ? (
                      <ArrowUpRight className="h-2.5 w-2.5 text-stock-up" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 text-stock-down" />
                    )}
                    <span
                      className={`text-[9px] font-semibold ${
                        isPositive ? "text-stock-up" : "text-stock-down"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {(stock.change ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
