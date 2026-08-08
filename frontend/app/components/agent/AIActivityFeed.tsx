"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Sparkles, Terminal, CheckCircle2 } from "lucide-react";
import TypingLoop from "./TypingLoop";

export interface ActivityMessage {
  id: string;
  sender: "agent" | "system" | "user";
  text: string;
  timestamp: string;
  details?: string[];
  isStreaming?: boolean;
}

interface AIActivityFeedProps {
  messages: ActivityMessage[];
  isSearching: boolean;
}

export default function AIActivityFeed({ messages, isSearching }: AIActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSearching]);

  return (
    <div className="bg-white border border-[#CCBEB1] rounded-2xl p-5 shadow-md space-y-4 max-h-[420px] overflow-y-auto font-sans">
      <div className="flex items-center justify-between border-b border-[#CCBEB1]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center text-[#664930]">
            <Bot className="w-3.5 h-3.5 text-[#664930]" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#664930]">
            Autonomous Agent Stream
          </span>
        </div>
        {isSearching && <TypingLoop className="text-[#664930]" />}
      </div>

      <div className="space-y-3.5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center shrink-0 mt-0.5">
                {msg.sender === "user" ? (
                  <User className="w-3.5 h-3.5 text-[#664930]" />
                ) : msg.sender === "agent" ? (
                  <Sparkles className="w-3.5 h-3.5 text-[#664930]" />
                ) : (
                  <Terminal className="w-3.5 h-3.5 text-[#664930]" />
                )}
              </div>

              <div className="flex-1 bg-[#FFFBF7] border border-[#CCBEB1] rounded-2xl p-3.5 text-xs leading-relaxed text-[#664930]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#664930]">
                    {msg.sender === "user" ? "User Request" : msg.sender === "agent" ? "CareerAtlas AI" : "System Log"}
                  </span>
                  <span className="font-mono text-[10px] text-[#997E67]" suppressHydrationWarning>{msg.timestamp}</span>
                </div>

                <p className="text-[#664930] font-medium whitespace-pre-wrap">{msg.text}</p>

                {msg.details && msg.details.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#CCBEB1]/60 flex flex-wrap gap-1.5">
                    {msg.details.map((detail, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FFDBBB] border border-[#CCBEB1] text-[#664930] text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#664930]" />
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
