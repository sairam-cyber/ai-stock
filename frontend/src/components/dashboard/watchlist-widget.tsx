"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  vol: string;
}

export function WatchlistWidget() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (!user?.watchlist || user.watchlist.length === 0) {
        setStocks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const promises = user.watchlist.slice(0, 5).map(async (symbol) => {
          try {
            const { data } = await api.get(`/stocks/${symbol}/summary`);
            if (data.success) {
              return {
                symbol: symbol,
                name: data.data.name || symbol,
                price: data.data.price ?? 0,
                change: data.data.change ?? 0,
                vol: data.data.vol || "N/A",
              };
            }
          } catch (err) {
            console.error(`Failed to load details for watchlist item ${symbol}:`, err);
          }
          return {
            symbol: symbol,
            name: symbol,
            price: 0,
            change: 0,
            vol: "N/A",
          };
        });

        const results = await Promise.all(promises);
        setStocks(results);
      } catch (err) {
        console.error("Error loading watchlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistDetails();
  }, [user?.watchlist]);

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
            Watchlist
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 rounded-lg"
            onClick={() => router.push("/dashboard/watchlist")}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Loading active watchlist...</span>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Star className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Your watchlist is empty</p>
              <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto">
                Explore stocks to add them to your watchlist.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 rounded-lg"
              onClick={() => router.push("/dashboard/stocks")}
            >
              Find Stocks
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2 px-2 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Stock</span>
              <span className="text-right">Price</span>
              <span className="text-right">Change</span>
              <span className="text-right">Vol</span>
            </div>

            {/* Rows */}
            {stocks.map((stock, i) => {
              const isPositive = stock.change >= 0;
              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => router.push(`/dashboard/stocks/${stock.symbol}`)}
                  className="grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center rounded-xl px-2 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-right">
                    ${(stock.price ?? 0).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-0.5">
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-stock-up" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-stock-down" />
                    )}
                    <span
                      className={`text-[10px] font-semibold ${
                        isPositive ? "text-stock-up" : "text-stock-down"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {(stock.change ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">
                    {stock.vol}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
