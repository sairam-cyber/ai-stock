"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export function AIChatAssistant({ symbol }: { symbol: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: `Hello! I am your AI assistant. Ask me anything about ${symbol}. I can analyze its financial indicators, forecast its price, or check its latest social media trends.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = input.trim();
    if (!queryText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.id !== "1")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          content: m.text,
        }));

      const { data } = await api.post("/ai/chat", {
        symbol,
        query: queryText,
        chat_history: history,
      });

      if (data.success) {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.response,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, response]);
      } else {
        throw new Error(data.message || "Failed to fetch response");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Connection to assistant timed out.";
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `I'm sorry, I'm having trouble analyzing ${symbol} right now. (Error: ${errorMessage})`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card glass className="h-[480px] flex flex-col">
      <CardHeader className="pb-3 border-b border-border shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">AI Stock Assistant</p>
            <p className="text-[10px] text-muted-foreground font-normal">Analyzing {symbol} live</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-[9px] flex items-center gap-0.5">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      
      {/* Messages viewport */}
      <div ref={scrollRef} className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                      {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl p-3 text-xs leading-relaxed ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-accent/40 text-foreground border border-border/40 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-[9px] text-muted-foreground ${isUser ? "text-right" : ""}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-muted">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 bg-accent/30 border border-border/40 rounded-2xl rounded-tl-none p-3 px-4">
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  <span className="text-[10px] text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input container */}
      <form onSubmit={handleSend} className="p-3 border-t border-border shrink-0 bg-background/50 flex gap-2">
        <Input
          type="text"
          placeholder={`Ask about ${symbol}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-9 rounded-xl text-xs"
        />
        <Button type="submit" size="icon" className="h-9 w-9 rounded-xl shrink-0">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </Card>
  );
}
import { Badge } from "@/components/ui/badge";
