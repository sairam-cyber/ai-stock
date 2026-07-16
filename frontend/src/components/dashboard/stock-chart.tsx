"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, ISeriesApi, CandlestickSeries, LineSeries } from "lightweight-charts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ChartSkeleton } from "@/components/ui/skeletons";
import { ErrorState } from "@/components/ui/error-state";

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function StockChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [period, setPeriod] = useState<string>("1y");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  // Fetch real stock history from the API
  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(false);
      try {
        let interval = "1d";
        if (period === "1mo" || period === "5d") interval = "1h";
        if (period === "1d") interval = "5m";

        const res = await api.get(`/stocks/${symbol}/history`, {
          params: { period, interval },
        });

        if (res.data.success && active) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(`Failed to load history for ${symbol}:`, err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();
    return () => { active = false; };
  }, [symbol, period]);

  // Chart rendering and resizing logic
  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0 || loading) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const isDark = theme === "dark" || theme === undefined;
    const bgColor = isDark ? "#0c0a09" : "#ffffff";
    const textColor = isDark ? "#a8a29e" : "#57534e";
    const gridColor = isDark ? "rgba(41, 37, 36, 0.4)" : "rgba(231, 229, 228, 0.5)";

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 380,
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    if (chartType === "candlestick") {
      const candlestickSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        wickUpColor: "#22c55e",
      });
      candlestickSeries.setData(data);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chartRef.current.addSeries(LineSeries, {
        color: "#8b5cf6",
        lineWidth: 2,
      });
      const lineData = data.map((d) => ({ time: d.time, value: d.close }));
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    }

    chartRef.current.timeScale().fitContent();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
    };
  }, [data, theme, chartType, loading]);

  const periods = [
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" },
  ];

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg font-bold">{symbol} Price Action</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time charting and volume</p>
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selection */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  period === p.value 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selection */}
          <div className="flex gap-1">
            <Button
              variant={chartType === "candlestick" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 rounded-lg text-xs"
              onClick={() => setChartType("candlestick")}
            >
              Candles
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 rounded-lg text-xs"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <ErrorState
            type="server"
            title="Chart data unavailable"
            message="Could not fetch historical price data. Make sure the ML service is running."
            onRetry={() => { setError(false); setLoading(true); }}
          />
        ) : (
          <div ref={chartContainerRef} className="w-full relative min-h-[380px]" />
        )}
      </CardContent>
    </Card>
  );
}
