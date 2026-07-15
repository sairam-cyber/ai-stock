"use client";

import { motion } from "framer-motion";
import { Bell, ShieldAlert, Sparkles, TrendingUp, Cpu, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "AI Model Retrained Successfully",
    description: "XGBoost weight vectors for NVDA have been updated. The 30-day forecast projection has revised upward.",
    time: "30 mins ago",
    type: "ml",
    icon: Cpu,
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    id: 2,
    title: "Price Threshold Alert: AAPL",
    description: "Apple Inc. (AAPL) rose above your threshold limit of $195.00, hitting $196.20.",
    time: "2 hours ago",
    type: "price",
    icon: TrendingUp,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: 3,
    title: "Smart Insights Digest Available",
    description: "AI Stock compiled your daily market sentiments report. Heavy bullish news volume observed on Technology sector.",
    time: "5 hours ago",
    type: "insight",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: 4,
    title: "Security Event: Login Detected",
    description: "A successful login session was initialized from Firefox/Windows 10.",
    time: "1 day ago",
    type: "security",
    icon: CheckCircle,
    color: "text-blue-500 bg-blue-500/10",
  },
];

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alerts & Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage system events, custom price threshold alerts, and machine learning engine callbacks
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs rounded-xl">
          Mark all read
        </Button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {NOTIFICATIONS.map((notif, i) => {
          const IconComponent = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card glass className="hover:bg-accent/30 transition-colors">
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ${notif.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground">{notif.title}</h3>
                      <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
