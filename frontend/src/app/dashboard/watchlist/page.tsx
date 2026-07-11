"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stockDatabase: Record<
  string,
  { name: string; price: number; change: number; volume: string }
> = {
  AAPL: { name: "Apple Inc.", price: 198.45, change: 2.34, volume: "45.2M" },
  TSLA: { name: "Tesla Inc.", price: 248.72, change: -1.56, volume: "82.1M" },
  GOOGL: { name: "Alphabet Inc.", price: 176.89, change: 1.12, volume: "22.8M" },
  META: { name: "Meta Platforms", price: 505.31, change: 3.45, volume: "18.5M" },
  NVDA: { name: "NVIDIA Corp.", price: 875.63, change: 4.21, volume: "55.3M" },
  MSFT: { name: "Microsoft Corp.", price: 421.32, change: -0.67, volume: "22.8M" },
  AMZN: { name: "Amazon.com Inc.", price: 185.47, change: 0.89, volume: "35.7M" },
};

export default function WatchlistPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.watchlist) {
      setWatchlist(user.watchlist);
    }
    setLoading(false);
  }, [user]);

  const handleRemove = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    try {
      const { data } = await api.post("/portfolio/watchlist", { symbol });
      if (data.success) {
        setWatchlist(data.data.watchlist);
        if (user) {
          user.watchlist = data.data.watchlist;
        }
        toast.success(`${symbol} removed from Watchlist`);
      }
    } catch (error) {
      toast.error("Failed to remove stock");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[50vh]">
        <span className="text-sm text-muted-foreground">Loading watchlist...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          My Watchlist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your favorite assets and their real-time performance indicators
        </p>
      </div>

      {watchlist.length === 0 ? (
        <Card glass className="p-8 text-center">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Your watchlist is empty</h3>
              <p className="text-xs text-muted-foreground">
                Search for stocks and add them to monitor price action.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl"
            >
              Explore Markets
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((symbol, i) => {
            const stock = stockDatabase[symbol] || {
              name: "Unknown Stock",
              price: 100.0,
              change: 0.0,
              volume: "N/A",
            };
            const isPositive = stock.change >= 0;

            return (
              <motion.div
                key={symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => router.push(`/dashboard/stocks/${symbol}`)}
                className="cursor-pointer"
              >
                <Card glass className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-bold">
                        {symbol.slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold">{symbol}</CardTitle>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                      onClick={(e) => handleRemove(symbol, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-lg font-bold">${stock.price.toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Vol: {stock.volume}</p>
                      </div>
                      <Badge
                        variant={isPositive ? "success" : "danger"}
                        className="flex items-center gap-0.5 text-[10px]"
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {isPositive ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
