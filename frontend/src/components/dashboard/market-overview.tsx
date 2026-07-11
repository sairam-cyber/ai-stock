"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const indices = [
  {
    name: "S&P 500",
    value: "5,482.87",
    change: "+1.23%",
    changeValue: "+66.74",
    positive: true,
    sparkline: [40, 42, 38, 45, 50, 48, 52, 55, 53, 58, 60, 62],
  },
  {
    name: "NASDAQ",
    value: "17,245.31",
    change: "+1.68%",
    changeValue: "+284.56",
    positive: true,
    sparkline: [35, 38, 42, 40, 45, 48, 46, 50, 55, 52, 58, 60],
  },
  {
    name: "DOW",
    value: "39,872.99",
    change: "-0.32%",
    changeValue: "-128.05",
    positive: false,
    sparkline: [55, 52, 54, 50, 48, 50, 46, 44, 47, 45, 43, 42],
  },
  {
    name: "Russell 2000",
    value: "2,058.42",
    change: "+0.87%",
    changeValue: "+17.82",
    positive: true,
    sparkline: [30, 32, 28, 35, 33, 38, 40, 42, 39, 44, 46, 45],
  },
];

// ─── Sparkline SVG ────────────────────────────
function Sparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const color = positive ? "var(--stock-up)" : "var(--stock-down)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id={`spark-${positive ? "up" : "down"}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${positive ? "up" : "down"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {indices.map((index, i) => (
        <motion.div
          key={index.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <Card
            glass
            className="group hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {index.name}
                  </p>
                  <p className="text-xl font-bold mt-0.5">{index.value}</p>
                </div>
                <Badge
                  variant={index.positive ? "success" : "danger"}
                  className="flex items-center gap-0.5"
                >
                  {index.positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {index.change}
                </Badge>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-xs font-medium ${
                    index.positive ? "text-stock-up" : "text-stock-down"
                  }`}
                >
                  {index.changeValue}
                </span>
                <Sparkline
                  data={index.sparkline}
                  positive={index.positive}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
