import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { RouteProgressBar } from "@/components/ui/route-progress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Stock | Intelligent Stock Analysis & Predictions",
  description:
    "AI-powered stock analysis platform with real-time predictions, smart portfolio management, and actionable market insights driven by machine learning.",
  keywords: [
    "AI stock analysis",
    "stock predictions",
    "machine learning trading",
    "portfolio management",
    "market insights",
  ],
  authors: [{ name: "AI Stock Platform" }],
  openGraph: {
    title: "AI Stock | Intelligent Stock Analysis & Predictions",
    description:
      "AI-powered stock analysis with real-time predictions and smart insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <RouteProgressBar />
          {/* Aurora Background */}
          <div className="aurora-bg" aria-hidden="true">
            <div className="aurora-blob" />
            <div className="aurora-blob" />
            <div className="aurora-blob" />
            <div className="aurora-blob" />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
