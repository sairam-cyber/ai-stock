"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, Loader2, User, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META"];

export default function AIAssistantPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hello! I am your AI stock assistant. Select an asset above and ask me anything about its financials, price trends, forecast data, or sentiment metrics.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setQuery("");
    setLoading(true);

    try {
      // Map existing messages to history format
      const history = messages
        .filter((msg) => msg.text !== "")
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          content: msg.text,
        }));

      const { data } = await api.post("/ai/chat", {
        symbol,
        query: userText,
        chat_history: history,
      });

      if (data.success) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "I encountered an error trying to process that request. Please try again." },
        ]);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Failed to connect to AI service. Please verify your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Chat Assistant
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time financial analysis, valuations, and sentiments powered by Gemini
          </p>
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center gap-2 bg-muted/50 border border-border p-1 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-muted-foreground pl-2.5">Focus Asset:</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-card text-xs font-bold border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {STOCK_SYMBOLS.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <Card glass className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 ${!isBot ? "flex-row-reverse" : ""}`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-md ${
                      isBot
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isBot
                        ? "bg-muted border border-border text-foreground rounded-tl-none"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted border border-border text-foreground rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-border shrink-0 bg-muted/20">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask me about ${symbol} (e.g. "What is the valuation?", "What is the price trend?")`}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
            />
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-xl px-4 flex items-center justify-center"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
