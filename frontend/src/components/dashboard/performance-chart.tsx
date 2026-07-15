"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface PerformancePoint {
  date: string;
  value: number;
}

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export function PerformanceChart() {
  const [data, setData] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState("1M");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get("/portfolio");
        if (res.success && res.data) {
          const rawHistory = res.data.history || [];
          const cash = res.data.cashBalance ?? 100000;

          if (rawHistory.length < 2) {
            // Generate a baseline history for a fresh account (30 days of cash)
            const fallback: PerformancePoint[] = [];
            const now = new Date();
            for (let i = 30; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(d.getDate() - i);
              fallback.push({
                date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                value: cash,
              });
            }
            setData(fallback);
          } else {
            // Map the actual history records
            const mapped = rawHistory.map((item: any) => {
              const d = new Date(item.date);
              return {
                date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                value: Number(item.totalValue),
              };
            });
            setData(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch performance history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Portfolio Performance</CardTitle>
          <div className="flex items-center gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={range === activeRange ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveRange(range)}
                className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                  range === activeRange
                    ? "bg-primary/15 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[280px] space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Loading performance data...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  strokeOpacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  tickMargin={4}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    backdropFilter: "blur(16px)",
                    fontSize: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}
                  formatter={(value: any) => [
                    `$${Number(value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`,
                    "Portfolio",
                  ]}
                  labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#portfolioGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#8b5cf6",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
