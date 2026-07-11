"use client";

import { useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Generate realistic-looking portfolio data
function generateData() {
  const data = [];
  let value = 110000;
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.42) * 1200;
    value = Math.max(value, 95000);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export function PerformanceChart() {
  const data = useMemo(() => generateData(), []);

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Portfolio Performance</CardTitle>
          <div className="flex items-center gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={range === "1M" ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-2.5 text-xs rounded-lg ${
                  range === "1M"
                    ? "bg-primary/15 text-primary hover:bg-primary/20"
                    : ""
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.70 0.25 270)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.70 0.25 270)" stopOpacity={0} />
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
                stroke="oklch(0.70 0.25 270)"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "oklch(0.70 0.25 270)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
