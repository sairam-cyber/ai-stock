"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, LineChart, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PRESET_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", price: 198.45, change: 2.34, sector: "Technology", cap: "3.08T" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 421.32, change: -0.67, sector: "Technology", cap: "3.15T" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.72, change: -1.56, sector: "Automotive", cap: "790.2B" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.63, change: 4.21, sector: "Technology", cap: "2.19T" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 185.47, change: 0.89, sector: "Consumer Cyclical", cap: "1.92T" },
];

export default function StocksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = PRESET_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/stocks/${searchQuery.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            Stock Assets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and explore tracked stock symbols with real-time AI analytics.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search symbol (e.g. AAPL, TSLA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl animate-fade-in"
          />
        </div>
        <Button type="submit" className="rounded-xl">
          Search
        </Button>
      </form>

      {/* Grid of Preset Stocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock, i) => {
          const isPositive = stock.change >= 0;
          return (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => router.push(`/dashboard/stocks/${stock.symbol}`)}
              className="cursor-pointer"
            >
              <Card glass className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{stock.symbol}</CardTitle>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">
                    {stock.sector}
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 pt-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Market Cap</span>
                      <p className="text-base font-bold mt-0.5">{stock.cap}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold">${stock.price.toFixed(2)}</p>
                      <Badge
                        variant={isPositive ? "success" : "danger"}
                        className="inline-flex items-center gap-0.5 text-[9px] mt-1"
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5" />
                        )}
                        {isPositive ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <Card glass className="p-8 text-center max-w-md mx-auto">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">No presets match &quot;{searchQuery}&quot;</h3>
              <p className="text-xs text-muted-foreground">
                You can still press enter or click Search to dynamically query and fetch real-time analysis for this ticker.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
