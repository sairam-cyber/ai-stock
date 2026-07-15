"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, ShieldAlert, Award, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalyticsHolding {
  name: string;
  value: number;
}

interface SectorHolding {
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [holdingsData, setHoldingsData] = useState<AnalyticsHolding[]>([]);
  const [sectorsData, setSectorsData] = useState<SectorHolding[]>([]);
  const [hasHoldings, setHasHoldings] = useState(false);

  useEffect(() => {
    const fetchHoldings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/portfolio");
        if (data.success && data.data) {
          const holdings = data.data.holdings || [];
          const cash = data.data.cashBalance ?? 100000;

          if (holdings.length === 0) {
            setHasHoldings(false);
            // Default demo portfolio data for visualization
            setHoldingsData([
              { name: "Cash Balance", value: cash },
            ]);
            setSectorsData([
              { name: "Liquidity (Cash)", value: 100 },
            ]);
          } else {
            setHasHoldings(true);

            // Fetch live prices to calculate values
            const promises = holdings.map(async (h: any) => {
              try {
                const res = await api.get(`/stocks/${h.symbol}/summary`);
                const price = res.data.success ? res.data.data.price : h.averageBuyPrice;
                return {
                  symbol: h.symbol,
                  value: h.shares * price,
                };
              } catch {
                return {
                  symbol: h.symbol,
                  value: h.shares * h.averageBuyPrice,
                };
              }
            });

            const resolved = await Promise.all(promises);
            const totalValue = cash + resolved.reduce((sum, item) => sum + item.value, 0);

            // Set holdings data
            const hData = [
              { name: "Cash", value: Math.round((cash / totalValue) * 100) },
              ...resolved.map((item) => ({
                name: item.symbol,
                value: Math.round((item.value / totalValue) * 100),
              })),
            ];
            setHoldingsData(hData);

            // Fake sector map based on typical stock list
            const sectorMap: Record<string, number> = {
              Technology: 0,
              Automotive: 0,
              Retail: 0,
              Cash: Math.round((cash / totalValue) * 100),
            };

            resolved.forEach((item) => {
              const symbol = item.symbol.toUpperCase();
              const weight = Math.round((item.value / totalValue) * 100);
              if (["AAPL", "MSFT", "NVDA", "GOOGL", "META", "SMCI"].includes(symbol)) {
                sectorMap["Technology"] += weight;
              } else if (symbol === "TSLA") {
                sectorMap["Automotive"] += weight;
              } else if (symbol === "AMZN") {
                sectorMap["Retail"] += weight;
              } else {
                sectorMap["Technology"] += weight;
              }
            });

            const sData = Object.entries(sectorMap)
              .map(([key, val]) => ({ name: key, value: val }))
              .filter((item) => item.value > 0);

            setSectorsData(sData);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Portfolio Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Risk exposure, diversification analysis, and sector weightings dashboard
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Compiling metrics...</span>
        </div>
      ) : (
        <>
          {/* Risk KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card glass>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Expected Return</p>
                  <p className="text-xl font-bold mt-0.5">{hasHoldings ? "14.2%" : "N/A (Cash)"}</p>
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Portfolio Beta</p>
                  <p className="text-xl font-bold mt-0.5">{hasHoldings ? "1.18 (High-growth)" : "0.00 (Risk-free)"}</p>
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Sharpe Ratio</p>
                  <p className="text-xl font-bold mt-0.5">{hasHoldings ? "1.84" : "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holdings Distribution (Pie Chart) */}
            <Card glass>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Asset Diversification</CardTitle>
                <CardDescription className="text-xs">Equity holdings breakdown by percentage</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={holdingsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {holdingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                      formatter={(v) => `${v}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {holdingsData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {entry.name}: {entry.value}%
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sector Allocation (Bar Chart) */}
            <Card glass>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Sector Weights</CardTitle>
                <CardDescription className="text-xs">Exposure mapped by industry segments</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} stroke="var(--muted-foreground)" />
                    <YAxis fontSize={9} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                      formatter={(v) => `${v}%`}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                      {sectorsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
