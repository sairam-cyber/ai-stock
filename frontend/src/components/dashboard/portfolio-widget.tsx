"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 25, price: 198.45, change: +2.34, alloc: 28 },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 10, price: 176.89, change: +1.12, alloc: 20 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 15, price: 421.32, change: -0.67, alloc: 24 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 8, price: 875.63, change: +4.21, alloc: 18 },
  { symbol: "AMZN", name: "Amazon.com", shares: 12, price: 185.47, change: +0.89, alloc: 10 },
];

const totalValue = 127834.52;
const dayChange = 2341.87;
const dayChangePct = 1.86;

export function PortfolioWidget() {
  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Portfolio
          </CardTitle>
          <Badge variant="success" className="text-[10px]">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            +{dayChangePct}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Total Value */}
        <div>
          <p className="text-3xl font-bold">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-stock-up mt-1">
            +${dayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
            today
          </p>
        </div>

        {/* Allocation Bar */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Allocation
          </p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {holdings.map((h, i) => {
              const colors = [
                "bg-blue-500",
                "bg-emerald-500",
                "bg-violet-500",
                "bg-amber-500",
                "bg-rose-500",
              ];
              return (
                <motion.div
                  key={h.symbol}
                  initial={{ width: 0 }}
                  animate={{ width: `${h.alloc}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  className={`${colors[i]} rounded-full`}
                />
              );
            })}
          </div>
        </div>

        {/* Holdings List */}
        <div className="space-y-2.5">
          {holdings.map((h, i) => (
            <motion.div
              key={h.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              className="flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                  {h.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{h.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {h.shares} shares
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  ${h.price.toFixed(2)}
                </p>
                <p
                  className={`text-[10px] font-medium ${
                    h.change >= 0 ? "text-stock-up" : "text-stock-down"
                  }`}
                >
                  {h.change >= 0 ? "+" : ""}
                  {h.change.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
