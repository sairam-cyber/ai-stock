"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-aurora-2/80" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                radial-gradient(circle at 60% 80%, white 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px, 80px 80px, 100px 100px",
            }}
          />

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to Transform Your
              <br />
              Investment Strategy?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80 text-lg">
              Join thousands of investors using AI to gain a competitive edge.
              Start free — no credit card required.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 active:scale-[0.98]"
                asChild
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Get Started for Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
