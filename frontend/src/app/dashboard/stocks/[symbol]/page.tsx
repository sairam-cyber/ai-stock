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
  Brain,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockChart } from "@/components/dashboard/stock-chart";
import { SentimentTracker } from "@/components/dashboard/sentiment-tracker";
import { AIChatAssistant } from "@/components/dashboard/ai-chat-assistant";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatsGridSkeleton } from "@/components/ui/skeletons";
import { ErrorState } from "@/components/ui/error-state";

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
  const [error, setError] = useState(false);
  const [flashState, setFlashState] = useState<"up" | "down" | null>(null);

  // Forecast states
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [preferredModel, setPreferredModel] = useState("xgboost");
  const [forecastLoading, setForecastLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);

  // Trading states
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeShares, setTradeShares] = useState<number>(1);
  const [isTrading, setIsTrading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get("/portfolio");
      if (data.success) {
        setPortfolio(data.data);
      }
    } catch (error) {
      console.error("Failed to load portfolio details for trading:", error);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeShares <= 0) {
      toast.error("Please enter a valid number of shares.");
      return;
    }

    setIsTrading(true);
    try {
      if (tradeType === "buy") {
        const { data } = await api.post("/portfolio/buy", {
          symbol: symbol,
          name: stock?.name || symbol + " Corporation",
          shares: Number(tradeShares),
          price: Number(stock?.price || 0),
        });
        if (data.success) {
          toast.success(data.message);
          setIsTradeDialogOpen(false);
          setTradeShares(1);
          fetchPortfolio();
        }
      } else {
        const { data } = await api.post("/portfolio/sell", {
          symbol: symbol,
          shares: Number(tradeShares),
          price: Number(stock?.price || 0),
        });
        if (data.success) {
          toast.success(data.message);
          setIsTradeDialogOpen(false);
          setTradeShares(1);
          fetchPortfolio();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to execute ${tradeType} trade`);
    } finally {
      setIsTrading(false);
    }
  };

  // Fetch stock summary
  useEffect(() => {
    let active = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await api.get(`/stocks/${symbol}/summary`);
        if (data.success && active) {
          setStock(data.data);
        }
      } catch (err) {
        console.error("Error loading stock summary:", err);
        toast.error(`Could not retrieve details for ${symbol}`);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSummary();
    return () => { active = false; };
  }, [symbol]);

  // Fetch forecast
  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const { data } = await api.get(`/stocks/${symbol}/forecast`, {
        params: { days: forecastDays, model: preferredModel }
      });
      setForecastData(data);
    } catch (err) {
      console.error("Error loading forecast model:", err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [symbol, forecastDays, preferredModel]);

  // Model Training
  const handleTrainModel = async () => {
    setTrainingLoading(true);
    try {
      const { data } = await api.post(`/stocks/${symbol}/train`, {}, {
        params: { model: preferredModel }
      });
      if (data.success) {
        toast.success(`Model trained successfully in ${data.duration_seconds}s!`);
        fetchForecast();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Model weight training failed");
    } finally {
      setTrainingLoading(false);
    }
  };

  // Real-time Socket.IO Stream for live ticks
  useEffect(() => {
    socket.connect();
    socket.emit("join-stock", symbol);

    const handlePriceUpdate = (update: {
      symbol: string;
      price: number;
      changeValue: number;
      change: number;
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
            changeValue: update.changeValue,
            change: update.change,
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

  const getForecastChartData = () => {
    if (!forecastData) return [];
    
    // Last 15 days of history for context
    const history = forecastData.historical.slice(-15).map((h: any) => ({
      time: h.time,
      price: h.value,
      type: "Historical"
    }));

    const lastHistory = history[history.length - 1];

    const forecast = forecastData.forecast.map((f: any) => ({
      time: f.time,
      forecast: f.value,
      lower: f.lower,
      upper: f.upper,
      type: "Forecast"
    }));

    if (lastHistory && forecast.length > 0) {
      forecast[0].price = lastHistory.price;
    }

    return [...history, ...forecast];
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="shimmer h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <div className="shimmer h-6 w-32 rounded-full" />
            <div className="shimmer h-3 w-48 rounded-full" />
          </div>
        </div>
        <StatsGridSkeleton count={4} />
        <div className="shimmer h-[420px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-6">
        <ErrorState
          type="server"
          title={`Could not load ${symbol}`}
          message="The ML service may be unavailable or the stock symbol is invalid. Try again."
          onRetry={() => {
            setError(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const mergedChartData = getForecastChartData();

  return (
    <div className="p-6 space-y-6 pb-16">
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
          <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="glow"
                size="sm"
                className="rounded-xl h-9 px-4"
                onClick={fetchPortfolio}
              >
                Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>Trade {symbol}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {stock?.name}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Execute mock trades for this asset and manage your portfolio positions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleTrade} className="space-y-4 pt-3">
                {/* Buy/Sell Selector */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setTradeType("buy")}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                      tradeType === "buy"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType("sell")}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                      tradeType === "sell"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Shares input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Shares
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Number(e.target.value))}
                    className="rounded-xl"
                    required
                  />
                </div>

                {/* Price & Balance Info */}
                <div className="rounded-xl border border-border bg-accent/20 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Price:</span>
                    <span className="font-bold">${(stock?.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Total:</span>
                    <span className="font-bold text-primary">
                      ${(tradeShares * (stock?.price || 0)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  {tradeType === "buy" ? (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Cash Balance:</span>
                      <span className={`font-semibold ${
                        (portfolio?.cashBalance || 0) < tradeShares * (stock?.price || 0)
                          ? "text-stock-down"
                          : "text-stock-up"
                      }`}>
                        ${(portfolio?.cashBalance || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Position Size:</span>
                      <span className={`font-semibold ${
                        (portfolio?.holdings?.find((h: any) => h.symbol === symbol)?.shares || 0) < tradeShares
                          ? "text-stock-down"
                          : "text-primary"
                      }`}>
                        {portfolio?.holdings?.find((h: any) => h.symbol === symbol)?.shares || 0} shares owned
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl font-semibold"
                  disabled={
                    isTrading ||
                    (tradeType === "buy" &&
                      (portfolio?.cashBalance || 0) < tradeShares * (stock?.price || 0)) ||
                    (tradeType === "sell" &&
                      (portfolio?.holdings?.find((h: any) => h.symbol === symbol)?.shares || 0) < tradeShares)
                  }
                >
                  {isTrading
                    ? "Processing trade..."
                    : tradeType === "buy"
                    ? `Buy ${tradeShares} shares of ${symbol}`
                    : `Sell ${tradeShares} shares of ${symbol}`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
            ${(stock.price ?? 0).toFixed(2)}
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
            {(stock.changeValue ?? 0).toFixed(2)} ({isPositive ? "+" : ""}
            {(stock.change ?? 0).toFixed(2)}%)
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

          {/* AI Forecast Engine Card */}
          <Card glass className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                  AI Forecast Engine
                </h3>
                <CardDescription className="text-xs mt-1">
                  Predict future prices and evaluate weights. Current:{" "}
                  <span className="font-semibold text-primary">
                    {forecastData?.model || "Loading..."}
                  </span>
                </CardDescription>
              </div>

              {/* Forecast Parameter Selector */}
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={preferredModel}
                  onChange={(e) => setPreferredModel(e.target.value)}
                  className="bg-background text-foreground text-xs rounded-xl border border-border px-3 py-1.5 h-9 font-medium"
                >
                  <option value="xgboost">XGBoost Weights</option>
                  <option value="ridge">Ridge Regression</option>
                  <option value="prophet">Prophet Model</option>
                </select>

                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  className="bg-background text-foreground text-xs rounded-xl border border-border px-3 py-1.5 h-9 font-medium"
                >
                  <option value={7}>7 Days Forecast</option>
                  <option value={14}>14 Days Forecast</option>
                  <option value={30}>30 Days Forecast</option>
                </select>

                <Button
                  onClick={handleTrainModel}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 gap-1 text-xs"
                  disabled={trainingLoading}
                >
                  {trainingLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Cpu className="h-3 w-3" />
                  )}
                  Retrain Weights
                </Button>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="h-[280px] w-full">
              {forecastLoading ? (
                <div className="h-full flex flex-col justify-center items-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground mt-2 font-medium">Re-computing price model...</span>
                </div>
              ) : (
                <RechartsResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={mergedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <RechartsCartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <RechartsXAxis
                      dataKey="time"
                      fontSize={9}
                      stroke="var(--muted-foreground)"
                      tickFormatter={(t) => t.slice(5)} // Show MM-DD
                    />
                    <RechartsYAxis
                      fontSize={9}
                      stroke="var(--muted-foreground)"
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                      formatter={(val: any, name: any) => [
                        val !== null && val !== undefined ? `$${Number(val).toFixed(2)}` : "N/A",
                        name === "price" ? "Actual / Connection" : name === "forecast" ? "AI Estimate" : name === "upper" ? "Confidence Upper" : "Confidence Lower",
                      ]}
                    />
                    {/* Actual historical line */}
                    <RechartsLine
                      type="monotone"
                      dataKey="price"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      name="price"
                    />
                    {/* Forecasted line */}
                    <RechartsLine
                      type="monotone"
                      dataKey="forecast"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="forecast"
                    />
                    {/* Upper confidence bounds */}
                    <RechartsLine
                      type="monotone"
                      dataKey="upper"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.5}
                      dot={false}
                      name="upper"
                    />
                    {/* Lower confidence bounds */}
                    <RechartsLine
                      type="monotone"
                      dataKey="lower"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.5}
                      dot={false}
                      name="lower"
                    />
                  </RechartsLineChart>
                </RechartsResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-4 bg-primary" /> Historical
              </div>
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-4 border-t-2 border-dashed border-[#8b5cf6]" /> AI Estimate (Next {forecastDays} Days)
              </div>
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-4 border-t border-dotted border-[#8b5cf6]" /> 95% Confidence Bounds
              </div>
            </div>
          </Card>

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
