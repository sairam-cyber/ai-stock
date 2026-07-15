"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  DollarSign,
  Plus,
  Trash2,
  Brain,
  Sparkles,
  Sliders,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  averageBuyPrice: number;
}

interface Portfolio {
  cashBalance: number;
  holdings: Holding[];
  history: Array<{ date: string; totalValue: number }>;
}

const COLORS = [
  "oklch(0.70 0.25 270)", // Purple
  "oklch(0.60 0.15 150)", // Green
  "oklch(0.65 0.20 200)", // Blue
  "oklch(0.75 0.15 80)",  // Orange
  "oklch(0.60 0.20 300)", // Violet
];

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  // Buy Dialog State
  const [buySymbol, setBuySymbol] = useState("");
  const [buyShares, setBuyShares] = useState(1);
  const [buyPrice, setBuyPrice] = useState(150);
  const [isBuying, setIsBuying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Optimizer State
  const [optimizeSymbols, setOptimizeSymbols] = useState("AAPL, MSFT, TSLA, NVDA, AMZN");
  const [riskFreeRate, setRiskFreeRate] = useState(2); // In percentage (e.g. 2%)
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get("/portfolio");
      if (data.success) {
        setPortfolio(data.data);
      }
    } catch (error) {
      toast.error("Failed to load portfolio details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (portfolio?.holdings && portfolio.holdings.length > 0) {
      setOptimizeSymbols(portfolio.holdings.map((h) => h.symbol).join(", "));
    }
  }, [portfolio]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buySymbol.trim() || buyShares <= 0 || buyPrice <= 0) {
      toast.error("Please fill in all transaction details correctly.");
      return;
    }

    setIsBuying(true);
    try {
      const { data } = await api.post("/portfolio/buy", {
        symbol: buySymbol.toUpperCase(),
        name: buySymbol.toUpperCase() + " Corporation", // mock name
        shares: Number(buyShares),
        price: Number(buyPrice),
      });

      if (data.success) {
        toast.success(data.message);
        setPortfolio(data.data);
        setIsDialogOpen(false);
        setBuySymbol("");
        setBuyShares(1);
        setBuyPrice(150);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to make transaction");
    } finally {
      setIsBuying(false);
    }
  };

  const handleSell = async (symbol: string, shares: number, price: number) => {
    try {
      const { data } = await api.post("/portfolio/sell", {
        symbol,
        shares,
        price,
      });

      if (data.success) {
        toast.success(data.message);
        setPortfolio(data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sell shares");
    }
  };

  const handleOptimize = async () => {
    if (!optimizeSymbols.trim()) {
      toast.error("Please specify at least 2 tickers for allocation analysis.");
      return;
    }
    setOptimizing(true);
    try {
      const { data } = await api.get("/stocks/optimize", {
        params: {
          symbols: optimizeSymbols,
          riskFreeRate: Number(riskFreeRate) / 100, // convert percentage to fraction
        },
      });
      setOptimizationResult(data);
      toast.success("AI portfolio optimization model calculated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Portfolio optimization model failure");
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[50vh]">
        <span className="text-sm text-muted-foreground">Loading portfolio details...</span>
      </div>
    );
  }

  const holdingsValue = portfolio?.holdings.reduce((sum, h) => sum + h.shares * h.averageBuyPrice, 0) || 0;
  const cash = portfolio?.cashBalance || 0;
  const totalVal = holdingsValue + cash;

  // Chart data formatting
  const chartData = [
    { name: "Cash", value: cash },
    ...(portfolio?.holdings.map((h) => ({
      name: h.symbol,
      value: h.shares * h.averageBuyPrice,
    })) || []),
  ];

  return (
    <div className="p-6 space-y-8 pb-16">
      {/* Header section with Buy action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            My Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track performance metrics, cash balances, and diversify holdings
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-9 gap-1.5">
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Asset to Portfolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBuy} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Symbol</label>
                <Input
                  placeholder="e.g. AAPL, NVDA"
                  value={buySymbol}
                  onChange={(e) => setBuySymbol(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Shares</label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    value={buyShares}
                    onChange={(e) => setBuyShares(Number(e.target.value))}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Buy Price ($)</label>
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(Number(e.target.value))}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={isBuying}>
                {isBuying ? "Processing transaction..." : "Confirm Purchase"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid summarizing values & allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value card metrics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card glass className="p-4">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Total Value
              </span>
              <p className="text-xl font-bold mt-1">${totalVal.toLocaleString()}</p>
            </Card>
            <Card glass className="p-4">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Stock Holdings
              </span>
              <p className="text-xl font-bold mt-1">${holdingsValue.toLocaleString()}</p>
            </Card>
            <Card glass className="p-4">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Cash Balance
              </span>
              <p className="text-xl font-bold mt-1">${cash.toLocaleString()}</p>
            </Card>
          </div>

          {/* Holdings List table */}
          <Card glass className="p-6">
            <CardTitle className="text-base font-semibold mb-4">Holdings Breakdown</CardTitle>
            {portfolio?.holdings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No active stock holdings. Use the add asset action to purchase stocks.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 px-2 py-1 text-[10px] text-muted-foreground font-semibold uppercase">
                  <span>Asset</span>
                  <span className="text-right">Shares</span>
                  <span className="text-right">Avg Price</span>
                  <span className="text-right">Total Cost</span>
                  <span className="text-right">Actions</span>
                </div>
                {portfolio?.holdings.map((h) => (
                  <div
                    key={h.symbol}
                    className="grid grid-cols-5 gap-2 items-center px-2 py-3 rounded-lg border border-border/40 hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{h.symbol}</span>
                    </div>
                    <span className="text-right text-xs">{h.shares}</span>
                    <span className="text-right text-xs">${h.averageBuyPrice.toFixed(2)}</span>
                    <span className="text-right text-xs font-semibold">
                      ${(h.shares * h.averageBuyPrice).toFixed(2)}
                    </span>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSell(h.symbol, h.shares, h.averageBuyPrice)}
                        className="h-7 px-2.5 hover:text-destructive text-[10px] rounded-lg"
                      >
                        Liquidate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Allocation Donut Chart */}
        <div>
          <Card glass className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" /> Asset Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center min-h-[300px]">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Allocation"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto mt-2">
                {chartData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-xs px-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">
                      {((item.value / totalVal) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* ─── AI PORTFOLIO OPTIMIZER (PHASE 4) ─── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Portfolio Optimizer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Utilize Markowitz Modern Portfolio Theory (Mean-Variance) to find optimal allocations based on Sharpe Ratio.
          </p>
        </div>

        <Card glass className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Tickers to Optimize
              </label>
              <Input
                placeholder="e.g. AAPL, MSFT, TSLA"
                value={optimizeSymbols}
                onChange={(e) => setOptimizeSymbols(e.target.value)}
                className="rounded-xl"
              />
              <span className="text-[10px] text-muted-foreground block">
                Comma-separated tickers (min 2). Automatically matches your holdings on load.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sliders className="h-3 w-3 text-primary" /> Risk-Free Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                className="rounded-xl"
              />
              <span className="text-[10px] text-muted-foreground block">
                Benchmark interest rate (default 2% / 0.02)
              </span>
            </div>

            <div>
              <Button
                onClick={handleOptimize}
                className="w-full rounded-xl gap-2 font-semibold"
                disabled={optimizing}
              >
                {optimizing ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    Calculating frontier...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Optimize Allocations
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Visuals */}
        <AnimatePresence>
          {optimizationResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Max Sharpe Ratio */}
              <Card glass className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="primary" className="rounded-lg px-2 py-0.5">
                      Max Sharpe Portfolio
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Optimal Risk/Reward</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Expected Return</span>
                      <span className="text-lg font-bold text-stock-up">
                        {(optimizationResult.maxSharpe.return * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Annualized Risk</span>
                      <span className="text-sm font-semibold">
                        {(optimizationResult.maxSharpe.volatility * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-bold text-primary">
                        {optimizationResult.maxSharpe.sharpeRatio.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground">Allocations:</span>
                    {Object.entries(optimizationResult.maxSharpe.allocation).map(([symbol, weight]: any) => (
                      <div key={symbol} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{symbol}</span>
                          <span>{(weight * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Min Volatility */}
              <Card glass className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="success" className="rounded-lg px-2 py-0.5">
                      Min Volatility Portfolio
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Safest Allocation</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Expected Return</span>
                      <span className="text-sm font-semibold">
                        {(optimizationResult.minVolatility.return * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Annualized Risk</span>
                      <span className="text-lg font-bold text-stock-down">
                        {(optimizationResult.minVolatility.volatility * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-bold">
                        {optimizationResult.minVolatility.sharpeRatio.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground">Allocations:</span>
                    {Object.entries(optimizationResult.minVolatility.allocation).map(([symbol, weight]: any) => (
                      <div key={symbol} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{symbol}</span>
                          <span>{(weight * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Efficient Frontier Plot */}
              <Card glass className="p-6 flex flex-col justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold mb-2">Efficient Frontier (Markowitz)</CardTitle>
                  <CardDescription className="text-[10px] mb-4">
                    Scatter mapping expected annual returns against risk volatility.
                  </CardDescription>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          type="number"
                          dataKey="volatility"
                          name="Risk"
                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                          fontSize={9}
                          stroke="var(--muted-foreground)"
                        />
                        <YAxis
                          type="number"
                          dataKey="return"
                          name="Return"
                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                          fontSize={9}
                          stroke="var(--muted-foreground)"
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            fontSize: "11px",
                          }}
                          formatter={(value: any, name: any) => [
                            value !== null && value !== undefined ? `${(Number(value) * 100).toFixed(1)}%` : "N/A",
                            name === "volatility" ? "Annual Risk" : "Expected Return",
                          ]}
                        />
                        <Scatter
                          name="Frontier Portfolios"
                          data={optimizationResult.efficientFrontier}
                          fill="var(--muted-foreground)"
                          opacity={0.35}
                        />
                        <Scatter
                          name="Optimal (Max Sharpe)"
                          data={[{
                            volatility: optimizationResult.maxSharpe.volatility,
                            return: optimizationResult.maxSharpe.return
                          }]}
                          fill="var(--primary)"
                        />
                        <Scatter
                          name="Min Risk (Min Vol)"
                          data={[{
                            volatility: optimizationResult.minVolatility.volatility,
                            return: optimizationResult.minVolatility.return
                          }]}
                          fill="oklch(0.60 0.15 150)"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary" /> Max Sharpe
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" /> Min Volatility
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/45" /> Simulated
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
