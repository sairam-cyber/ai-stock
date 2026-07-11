"use client";

import { motion } from "framer-motion";
import {
  Brain,
  LineChart,
  Shield,
  Zap,
  Bot,
  Globe,
  BarChart3,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description:
      "Our ensemble of TensorFlow, XGBoost, and Prophet models analyze millions of data points to predict stock movements with exceptional accuracy.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: LineChart,
    title: "Real-Time Analysis",
    description:
      "Stream live market data with WebSocket connections. Interactive TradingView-style charts with technical indicators and pattern recognition.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Bot,
    title: "AI Chat Assistant",
    description:
      "Ask questions about any stock in natural language. Powered by Google Gemini and LangChain for deep market intelligence.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Smart Portfolio",
    description:
      "AI-optimized portfolio allocation with risk scoring, diversification analysis, and automated rebalancing recommendations.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description:
      "Real-time price alerts, trend reversal notifications, and AI-detected anomaly warnings delivered via WebSocket push.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Advanced risk metrics including VaR, Sharpe ratio, and correlation analysis. Stress test your portfolio against historical scenarios.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "150+ Global Markets",
    description:
      "Access stocks across NYSE, NASDAQ, LSE, TSE, and more. Multi-currency support with real-time forex conversion.",
    gradient: "from-sky-500 to-cyan-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "JWT authentication, encrypted data storage, rate limiting, and GDPR compliance. Your financial data is always protected.",
    gradient: "from-red-500 to-orange-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to
            <br />
            <span className="gradient-text">Outsmart the Market</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
            A complete AI-powered toolkit designed for modern investors who want
            an unfair advantage.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card
                glass
                className="group h-full hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 cursor-default"
              >
                <CardContent className="p-6 pt-6">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
