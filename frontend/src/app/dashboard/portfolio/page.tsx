"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    <div className="p-6 space-y-6">
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
                {portfolio?.holdings.map((h, i) => (
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
    </div>
  );
}
