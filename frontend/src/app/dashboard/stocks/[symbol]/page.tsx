"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Zap,
  Globe,
  Activity,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockChart } from "@/components/dashboard/stock-chart";
import { SentimentTracker } from "@/components/dashboard/sentiment-tracker";
import { AIChatAssistant } from "@/components/dashboard/ai-chat-assistant";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";

interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  changeValue: number;
  change: number;
  cap: string;
  pe: string;
  eps: string;
  vol: string;
  avgVol: string;
  range: string;
  yield: string;
  sector: string;
  industry: string;
  summary: string;
}

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  const { user } = useAuthStore();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashState, setFlashState] = useState<"up" | "down" | null>(null);

  // Fetch stock summary
  useEffect(() => {
    let active = true;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stocks/${symbol}/summary`);
        if (data.success && active) {
          setStock(data.data);
        }
      } catch (err) {
        console.error("Error loading stock summary:", err);
        toast.error(`Could not retrieve details for ${symbol}`);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      active = false;
    };
  }, [symbol]);

  // Real-time Socket.IO Stream for live ticks
  useEffect(() => {
    socket.connect();
    socket.emit("join-stock", symbol);

    const handlePriceUpdate = (update: {
      symbol: string;
      price: number;
      change: number;
      changePercent: number;
    }) => {
      if (update.symbol.toUpperCase() === symbol.toUpperCase()) {
        setStock((prev) => {
          if (!prev) return null;
          
          if (update.price > prev.price) {
            setFlashState("up");
          } else if (update.price < prev.price) {
            setFlashState("down");
          }
          
          setTimeout(() => setFlashState(null), 1000);

          return {
            ...prev,
            price: update.price,
            changeValue: update.change,
            change: update.changePercent,
          };
        });
      }
    };

    socket.on("price-update", handlePriceUpdate);

    return () => {
      socket.emit("leave-stock", symbol);
      socket.off("price-update", handlePriceUpdate);
      socket.disconnect();
    };
  }, [symbol]);

  useEffect(() => {
    if (user?.watchlist?.includes(symbol)) {
      setInWatchlist(true);
    } else {
      setInWatchlist(false);
    }
  }, [user, symbol]);

  const handleWatchlistToggle = async () => {
    setIsWatchlistLoading(true);
    try {
      const { data } = await api.post("/portfolio/watchlist", { symbol });
      if (data.success) {
        setInWatchlist(data.data.isAdded);
        if (user) {
          user.watchlist = data.data.watchlist;
        }
        toast.success(
          data.data.isAdded
            ? `${symbol} added to Watchlist`
            : `${symbol} removed from Watchlist`
        );
      }
    } catch (e) {
      toast.error("Failed to update watchlist");
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground mt-3 font-semibold">Retrieving real-time stock data...</span>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-6 space-y-6 text-center">
        <h2 className="text-xl font-bold">Asset Not Found</h2>
        <p className="text-muted-foreground">We were unable to load details for {symbol}.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{symbol}</h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                {stock.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stock.sector && stock.sector !== "N/A" ? `${stock.sector} • ${stock.industry}` : "Real-time stock feed"}
            </p>
          </div>
        </div>

        {/* Watchlist toggle & Buy action */}
        <div className="flex items-center gap-2">
          <Button
            variant={inWatchlist ? "outline" : "default"}
            size="sm"
            onClick={handleWatchlistToggle}
            disabled={isWatchlistLoading}
            className="rounded-xl h-9 px-4 gap-1.5"
          >
            {inWatchlist ? (
              <>
                <Check className="h-4 w-4 text-stock-up" />
                Watching
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Watchlist
              </>
            )}
          </Button>
          <Button variant="glow" size="sm" className="rounded-xl h-9 px-4">
            Trade
          </Button>
        </div>
      </div>

      {/* Real-time Ticker Value Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-border bg-accent/10">
        <div className={`transition-all duration-300 rounded-lg p-1 ${
          flashState === "up" 
            ? "bg-stock-up/10 scale-102" 
            : flashState === "down" 
            ? "bg-stock-down/10 scale-102" 
            : ""
        }`}>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            Last Price
          </span>
          <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
            flashState === "up" 
              ? "text-stock-up" 
              : flashState === "down" 
              ? "text-stock-down" 
              : ""
          }`}>
            ${stock.price.toFixed(2)}
          </p>
        </div>
        <div className={`transition-all duration-300 rounded-lg p-1 ${
          flashState === "up" 
            ? "bg-stock-up/10 scale-102" 
            : flashState === "down" 
            ? "bg-stock-down/10 scale-102" 
            : ""
        }`}>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            Today&apos;s Change
          </span>
          <p
            className={`text-2xl font-bold mt-1 flex items-center gap-1 transition-colors duration-300 ${
              flashState === "up"
                ? "text-stock-up"
                : flashState === "down"
                ? "text-stock-down"
                : isPositive
                ? "text-stock-up"
                : "text-stock-down"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
            {isPositive ? "+" : ""}
            {stock.changeValue.toFixed(2)} ({isPositive ? "+" : ""}
            {stock.change.toFixed(2)}%)
          </p>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            Market Cap
          </span>
          <p className="text-2xl font-bold mt-1">{stock.cap}</p>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            Today&apos;s Volume
          </span>
          <p className="text-2xl font-bold mt-1">{stock.vol}</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Columns (Chart + Stats) */}
        <div className="xl:col-span-2 space-y-6">
          <StockChart symbol={symbol} />

          {/* Key Indicators Grid */}
          <Card glass>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Key Financials & Info
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { label: "P/E Ratio", value: stock.pe, icon: Award },
                  { label: "EPS (TTM)", value: stock.eps, icon: Zap },
                  { label: "Dividend Yield", value: stock.yield, icon: Globe },
                  { label: "52-Week Range", value: stock.range, icon: Activity },
                  { label: "Average Volume", value: stock.avgVol, icon: Activity },
                  { label: "Valuation Cap", value: stock.cap, icon: Award },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {stat.label}
                    </span>
                    <p className="text-base font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              {stock.summary && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Company Summary</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed font-normal">{stock.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sentiment + Assistant Chat) */}
        <div className="space-y-6">
          <SentimentTracker symbol={symbol} />
          <AIChatAssistant symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
