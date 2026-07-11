"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./animated-counter";

const stats = [
  { value: 98.7, suffix: "%", label: "Prediction Accuracy", decimals: 1 },
  { value: 50, suffix: "K+", label: "Active Users", decimals: 0 },
  { value: 2.4, suffix: "M", label: "Analyses Run", decimals: 1 },
  { value: 150, suffix: "+", label: "Markets Covered", decimals: 0 },
];

const floatingCards = [
  {
    icon: TrendingUp,
    label: "AAPL",
    value: "+4.82%",
    positive: true,
    delay: 0,
    position: "top-[18%] right-[8%]",
  },
  {
    icon: Shield,
    label: "Portfolio",
    value: "Protected",
    positive: true,
    delay: 0.2,
    position: "bottom-[22%] left-[6%]",
  },
  {
    icon: Zap,
    label: "AI Signal",
    value: "Strong Buy",
    positive: true,
    delay: 0.4,
    position: "top-[35%] left-[3%]",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by Advanced Machine Learning</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">The Future of</span>
            <span className="block mt-1 gradient-text">
              Stock Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            Harness the power of AI to predict market trends, analyze stocks in
            real-time, and build smarter portfolios. Make data-driven decisions
            with confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="glow" size="xl" asChild>
              <Link href="/signup" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 glass rounded-2xl p-6 md:p-8 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="mt-1 text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block">
          {floatingCards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.9 + card.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`absolute ${card.position} float`}
              style={{
                animationDelay: `${card.delay * 2}s`,
              }}
            >
              <div className="glass-strong rounded-2xl p-4 shadow-xl flex items-center gap-3 min-w-[160px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stock-up/10">
                  <card.icon className="h-5 w-5 text-stock-up" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {card.label}
                  </div>
                  <div className="text-sm font-bold text-stock-up">
                    {card.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
