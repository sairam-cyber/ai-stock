import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Stock | Sign In",
  description: "Sign in to your AI Stock account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left — Branding Panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:flex flex-col items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-aurora-2/10 to-aurora-3/15" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--foreground) 1px, transparent 1px),
              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 px-12 text-center max-w-lg">
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/30">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4">
            AI <span className="gradient-text">Stock</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Harness the power of artificial intelligence to predict market
            trends, analyze stocks in real-time, and build smarter portfolios.
          </p>

          {/* Floating stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: "98.7%", label: "Accuracy" },
              { value: "50K+", label: "Users" },
              { value: "150+", label: "Markets" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form Area */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                AI <span className="gradient-text">Stock</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
