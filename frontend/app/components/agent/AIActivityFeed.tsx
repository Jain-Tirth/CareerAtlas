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
    <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 max-h-[420px] overflow-y-auto font-sans scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Autonomous Agent Stream
          </span>
        </div>
        {isSearching && <TypingLoop className="text-blue-400" />}
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
              <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {msg.sender === "user" ? (
                  <User className="w-3.5 h-3.5 text-zinc-300" />
                ) : msg.sender === "agent" ? (
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 bg-[#111827]/70 border border-white/5 rounded-2xl p-3.5 text-xs leading-relaxed text-zinc-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                    {msg.sender === "user" ? "User Request" : msg.sender === "agent" ? "CareerAtlas AI" : "System Log"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500" suppressHydrationWarning>{msg.timestamp}</span>
                </div>

                <p className="text-zinc-200 font-medium whitespace-pre-wrap">{msg.text}</p>

                {msg.details && msg.details.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                    {msg.details.map((detail, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
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
