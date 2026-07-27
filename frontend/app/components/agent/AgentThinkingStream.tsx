"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import TextLoop from "../ui/TextLoop";

export interface ThinkingLog {
  id: string;
  text: string;
  timestamp?: string;
}

interface AgentThinkingStreamProps {
  isSearching: boolean;
  thinkingLogs: ThinkingLog[];
  finalResponse?: string;
  elapsedSeconds: number;
}

export default function AgentThinkingStream({
  isSearching,
  thinkingLogs,
  finalResponse,
  elapsedSeconds,
}: AgentThinkingStreamProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Auto expand while searching
  useEffect(() => {
    if (isSearching) {
      setIsExpanded(true);
    }
  }, [isSearching]);

  if (!isSearching && thinkingLogs.length === 0 && !finalResponse) {
    return null;
  }

  const formatTimer = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}m ${secs}s`;
  };

  const headerLoopTexts = thinkingLogs.length > 0
    ? thinkingLogs.map((l) => l.text)
    : ["Analyzing candidate profile...", "Scanning active job boards...", "Ranking opportunities..."];

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Sleek Motion Primitives AI Thinking Block */}
      <div className="bg-[#111827]/85 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all">
        {/* Thinking Header Bar with TextLoop */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5"
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Brain className={`w-3.5 h-3.5 ${isSearching ? "animate-pulse" : ""}`} />
            </div>

            <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
              {isSearching ? (
                <>
                  <span className="text-blue-400 font-bold shrink-0">
                    Thinking for {formatTimer(elapsedSeconds)}
                  </span>
                  <span className="text-zinc-600 select-none">•</span>
                  <TextLoop
                    items={headerLoopTexts}
                    intervalMs={2200}
                    className="text-zinc-300 font-medium text-xs truncate max-w-xs sm:max-w-md"
                  />
                </>
              ) : (
                <>
                  <span className="text-zinc-200 font-bold">Thought for {formatTimer(elapsedSeconds)}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono shrink-0">
            <span>{isExpanded ? "Hide thinking" : "View thinking"}</span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Continuous Real-Time Thought Logs */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-5 bg-[#09090B]/95 font-mono text-xs text-zinc-400 space-y-2.5 border-t border-white/5 leading-relaxed max-h-72 overflow-y-auto"
            >
              {thinkingLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-blue-500 font-bold select-none">•</span>
                  <span className="text-zinc-200 font-sans text-xs leading-normal">{log.text}</span>
                </div>
              ))}

              {isSearching && (
                <div className="flex items-center gap-2 pt-1 text-blue-400 text-xs italic font-sans animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Scanning listings, screening ATS keyword density, & evaluating match vectors...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Assistant Final Response Bubble */}
      {finalResponse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-950/20 border border-blue-500/30 rounded-2xl p-5 shadow-xl flex items-start gap-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-blue-400 block">
              CareerAtlas Assistant
            </span>
            <p className="text-zinc-200 text-sm leading-relaxed font-medium">
              {finalResponse}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
