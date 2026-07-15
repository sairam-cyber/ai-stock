"use client";

import { motion } from "framer-motion";
import { Newspaper, Star, MessageSquare, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ARTICLES = [
  {
    id: 1,
    title: "NVIDIA Outlines Next-Gen Rubin AI Chip Architecture at Keynote",
    source: "TechRadar",
    time: "2 hours ago",
    summary: "NVIDIA announced its upcoming Rubin architecture focusing on advanced memory bandwidth and next-generation liquid cooling systems. Analysts expect this will solidify their lead in generative AI GPU workloads.",
    sentiment: "Bullish",
    score: 94,
    tags: ["NVDA", "AI", "Chips"],
  },
  {
    id: 2,
    title: "Federal Reserve Signals Potential Rates Stabilization into Q3",
    source: "Bloomberg Financial",
    time: "4 hours ago",
    summary: "FOMC minutes indicate inflation targets are narrowing closer to the 2% threshold, suggesting monetary easing could commence later this year. Equities responded with a mid-day rally.",
    sentiment: "Bullish",
    score: 78,
    tags: ["Fed", "Macro", "Rates"],
  },
  {
    id: 3,
    title: "Apple WWDC to Unveil 'Apple Intelligence' Beta Suite",
    source: "Reuters",
    time: "6 hours ago",
    summary: "Apple is set to announce its privacy-first cloud and on-device generative models integrated directly into iOS 18. Partner agreements with major LLM developers are anticipated to be announced.",
    sentiment: "Bullish",
    score: 87,
    tags: ["AAPL", "WWDC", "AI"],
  },
  {
    id: 4,
    title: "Tesla Q2 Production Targets Hit by Gigafactory Berlin Bottleneck",
    source: "EVNews",
    time: "10 hours ago",
    summary: "Local utility grid expansion delays forced Gigafactory Berlin to pause lines temporarily, lowering estimated weekly production. Management indicates they will recover the deficit in late Q3.",
    sentiment: "Bearish",
    score: 32,
    tags: ["TSLA", "GigaBerlin", "EV"],
  },
  {
    id: 5,
    title: "Amazon Logistics Automates Multi-Tier Fulfilment Hubs via Robotics",
    source: "SupplyChain Journal",
    time: "1 day ago",
    summary: "Amazon announced the deployment of over 10,000 new autonomous transport robots in US fulfilment centers, projecting a 20% reduction in fulfillment times and lower operating overheads.",
    sentiment: "Neutral",
    score: 65,
    tags: ["AMZN", "Robotics", "Logistics"],
  },
];

export default function NewsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Financial News Feed
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Live financial markets news streams evaluated with real-time AI sentiment scores
        </p>
      </div>

      {/* News list */}
      <div className="space-y-4">
        {ARTICLES.map((article, i) => {
          const isBullish = article.sentiment === "Bullish";
          const isBearish = article.sentiment === "Bearish";

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Card glass className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start">
                  {/* Article Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted-foreground">
                      <span className="text-foreground font-bold">{article.source}</span>
                      <span>•</span>
                      <span>{article.time}</span>
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] py-0 px-1.5 rounded-md">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-sm font-bold leading-snug hover:text-primary transition-colors cursor-pointer">
                      {article.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* AI Sentiment analysis */}
                  <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-5 w-full md:w-32 shrink-0">
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">AI Sentiment</p>
                      <Badge
                        variant={isBullish ? "success" : isBearish ? "danger" : "secondary"}
                        className="flex items-center gap-0.5 font-bold"
                      >
                        {isBullish ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : isBearish ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : null}
                        {article.sentiment}
                      </Badge>
                    </div>
                    <div className="text-center mt-0.5">
                      <span
                        className={`text-lg font-extrabold ${
                          isBullish
                            ? "text-stock-up"
                            : isBearish
                              ? "text-stock-down"
                              : "text-primary"
                        }`}
                      >
                        {article.score}
                      </span>
                      <span className="text-[8px] text-muted-foreground block font-medium">Confidence Score</span>
                    </div>
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
