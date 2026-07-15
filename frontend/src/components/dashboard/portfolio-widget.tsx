"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Briefcase,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface HoldingItem {
  symbol: string;
  name: string;
  shares: number;
  averageBuyPrice: number;
  livePrice: number;
  liveChange: number;
  liveChangeValue: number;
  allocation: number;
}

export function PortfolioWidget() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cashBalance, setCashBalance] = useState(100000);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [totalValue, setTotalValue] = useState(100000);
  const [dayChange, setDayChange] = useState(0);
  const [dayChangePct, setDayChangePct] = useState(0);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/portfolio");
        if (data.success && data.data) {
          const portfolio = data.data;
          const rawHoldings = portfolio.holdings || [];
          const cash = portfolio.cashBalance ?? 100000;
          setCashBalance(cash);

          if (rawHoldings.length === 0) {
            setHoldings([]);
            setTotalValue(cash);
            setDayChange(0);
            setDayChangePct(0);
            setLoading(false);
            return;
          }

          // Fetch live summary details for each stock
          const promises = rawHoldings.map(async (h: any) => {
            try {
              const res = await api.get(`/stocks/${h.symbol}/summary`);
              if (res.data.success) {
                return {
                  symbol: h.symbol,
                  name: h.name || res.data.data.name || h.symbol,
                  shares: Number(h.shares),
                  averageBuyPrice: Number(h.averageBuyPrice),
                  livePrice: Number(res.data.data.price) || Number(h.averageBuyPrice),
                  liveChange: Number(res.data.data.change) || 0,
                  liveChangeValue: Number(res.data.data.changeValue) || 0,
                };
              }
            } catch (err) {
              console.error(`Failed to fetch live data for portfolio item ${h.symbol}:`, err);
            }
            return {
              symbol: h.symbol,
              name: h.name,
              shares: Number(h.shares),
              averageBuyPrice: Number(h.averageBuyPrice),
              livePrice: Number(h.averageBuyPrice),
              liveChange: 0,
              liveChangeValue: 0,
            };
          });

          const resolvedHoldings = await Promise.all(promises);

          // Calculate totals
          const holdingsValue = resolvedHoldings.reduce(
            (sum, item) => sum + item.shares * item.livePrice,
            0
          );
          const currentTotal = cash + holdingsValue;
          setTotalValue(currentTotal);

          // Total daily dollar change
          const dailyChangeVal = resolvedHoldings.reduce(
            (sum, item) => sum + item.shares * item.liveChangeValue,
            0
          );
          setDayChange(dailyChangeVal);

          // Daily percentage change
          const prevTotalValue = currentTotal - dailyChangeVal;
          const dailyChangePctVal = prevTotalValue > 0 ? (dailyChangeVal / prevTotalValue) * 100 : 0;
          setDayChangePct(dailyChangePctVal);

          // Compute allocations
          const mappedHoldings = resolvedHoldings.map((item) => {
            const itemValue = item.shares * item.livePrice;
            const allocation = currentTotal > 0 ? (itemValue / currentTotal) * 100 : 0;
            return {
              ...item,
              allocation,
            };
          });

          setHoldings(mappedHoldings);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const isPositive = dayChange >= 0;
  const cashAlloc = totalValue > 0 ? (cashBalance / totalValue) * 100 : 100;

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Portfolio
          </CardTitle>
          {!loading && (
            <Badge variant={isPositive ? "success" : "danger"} className="text-[10px] rounded-full">
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
              {isPositive ? "+" : ""}
              {dayChangePct.toFixed(2)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Loading portfolio details...</span>
          </div>
        ) : (
          <>
            {/* Total Value */}
            <div>
              <p className="text-3xl font-bold tracking-tight">
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                isPositive ? "text-stock-up" : "text-stock-down"
              }`}>
                {isPositive ? "+" : ""}
                ${dayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                today
              </p>
            </div>

            {/* Allocation Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-medium">
                <span>Asset Allocation</span>
                <span>Cash: {cashAlloc.toFixed(0)}%</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-muted">
                {/* Cash Allocation */}
                {cashAlloc > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cashAlloc}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-neutral-500 rounded-full"
                    title={`Cash: ${cashAlloc.toFixed(1)}%`}
                  />
                )}
                {/* Stock Allocation */}
                {holdings.map((h, i) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-emerald-500",
                    "bg-violet-500",
                    "bg-amber-500",
                    "bg-rose-500",
                    "bg-cyan-500",
                  ];
                  const color = colors[i % colors.length];
                  return (
                    <motion.div
                      key={h.symbol}
                      initial={{ width: 0 }}
                      animate={{ width: `${h.allocation}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                      className={`${color} rounded-full`}
                      title={`${h.symbol}: ${h.allocation.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Holdings List */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {holdings.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground">No holdings in portfolio</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Available cash balance: ${cashBalance.toLocaleString()}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-[10px] mt-2 h-auto p-0"
                    onClick={() => router.push("/dashboard/stocks")}
                  >
                    Start trading
                  </Button>
                </div>
              ) : (
                holdings.map((h, i) => {
                  const holdingPositive = h.liveChange >= 0;
                  return (
                    <motion.div
                      key={h.symbol}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      onClick={() => router.push(`/dashboard/stocks/${h.symbol}`)}
                      className="flex items-center justify-between group cursor-pointer hover:bg-accent/30 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                            {h.symbol}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {h.shares} shares @ ${h.averageBuyPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">
                          ${(h.shares * h.livePrice).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          className={`text-[9px] font-semibold flex items-center justify-end gap-0.5 ${
                            holdingPositive ? "text-stock-up" : "text-stock-down"
                          }`}
                        >
                          {holdingPositive ? "+" : ""}
                          {h.liveChange.toFixed(2)}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
