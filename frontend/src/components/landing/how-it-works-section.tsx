"use client";

import { motion } from "framer-motion";
import {
  Search,
  Brain,
  BarChart3,
  Bell,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: Search,
    title: "Search Any Stock",
    description:
      "Enter a ticker symbol or company name. Our platform instantly fetches real-time and historical data from global markets.",
  },
  {
    step: 2,
    icon: Brain,
    title: "AI Analyzes Everything",
    description:
      "Multiple ML models process price patterns, sentiment, volume, and macroeconomic signals to generate predictions.",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Get Actionable Insights",
    description:
      "Receive clear buy/sell/hold recommendations, price targets, risk scores, and detailed analysis reports.",
  },
  {
    step: 4,
    icon: Bell,
    title: "Stay Ahead",
    description:
      "Set smart alerts for price movements, trend reversals, and AI-detected opportunities. Never miss a trade.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
            From search to signal in seconds. Here&apos;s how AI Stock transforms your investment workflow.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative text-center"
            >
              {/* Step Number Ring */}
              <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20" />
                {/* Inner circle */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full glass-strong shadow-xl">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                {/* Step badge */}
                <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  {step.step}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
