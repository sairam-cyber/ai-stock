"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, TrendingUp, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Insight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  time: string;
}

const typeStyles = {
  bullish: {
    badge: "success" as const,
    label: "Bullish",
    iconColor: "text-stock-up",
    bg: "bg-stock-up/10",
    icon: TrendingUp,
  },
  risk: {
    badge: "danger" as const,
    label: "Risk",
    iconColor: "text-stock-down",
    bg: "bg-stock-down/10",
    icon: AlertTriangle,
  },
  opportunity: {
    badge: "default" as const,
    label: "Opportunity",
    iconColor: "text-primary",
    bg: "bg-primary/10",
    icon: Sparkles,
  },
};

export function AIInsightsPanel({ symbol = "NVDA" }: { symbol?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ai/${symbol}/insights`);
        if (res.data.success && active) {
          setInsights(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching AI insights:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInsights();
    return () => {
      active = false;
    };
  }, [symbol]);

  if (loading) {
    return (
      <Card glass className="h-full min-h-[350px] flex flex-col justify-center items-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-2 font-medium">Generating AI insights...</span>
      </Card>
    );
  }

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          AI Insights
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => {
          const style = typeStyles[insight.type as keyof typeof typeStyles] || typeStyles.opportunity;
          const Icon = style.icon;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group rounded-xl border border-border p-3.5 hover:bg-accent/50 transition-colors cursor-default"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg}`}
                >
                  <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate">
                      {insight.title}
                    </h4>
                    <Badge variant={style.badge} className="text-[10px] shrink-0">
                      {style.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-12 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                          className={`h-full rounded-full ${
                            insight.confidence > 85
                              ? "bg-stock-up"
                              : insight.confidence > 70
                                ? "bg-primary"
                                : "bg-amber-500"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {insight.confidence}%
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {insight.time}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
