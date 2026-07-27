"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronRight, Sparkles, CheckCircle2, Loader2, AlertCircle, Circle } from "lucide-react";
import TextLoop from "../ui/TextLoop";

export interface ThinkingLog {
  id: string;
  text: string;
  timestamp?: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "success" | "error";
  errorDetails?: string;
}

interface AgentThinkingStreamProps {
  isSearching: boolean;
  pipelineSteps?: PipelineStep[];
  thinkingLogs: ThinkingLog[];
  finalResponse?: string;
  elapsedSeconds: number;
}

export default function AgentThinkingStream({
  isSearching,
  pipelineSteps = [],
  thinkingLogs = [],
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

  // Derive header loop text from current running systematic step or latest log
  const currentRunningStep = pipelineSteps.find((s) => s.status === "running");
  const headerLoopTexts = currentRunningStep
    ? [`${currentRunningStep.name}: ${currentRunningStep.description}`]
    : thinkingLogs.length > 0
    ? thinkingLogs.map((l) => l.text)
    : ["Systematic Profile Embedding...", "Scraper Ingestion Suite...", "Cosine Similarity Math..."];

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Systematic AI Thinking Block */}
      <div className="bg-[#111827]/85 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all">
        {/* Thinking Header Bar */}
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

        {/* Collapsible Systematic Pipeline Steps & Execution Log Stream */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-5 bg-[#09090B]/95 space-y-5 border-t border-white/5"
            >
              {/* Systematic Pipeline Execution Timeline */}
              {pipelineSteps.length > 0 && (
                <div className="space-y-3 pb-4 border-b border-white/5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                    Systematic Pipeline Execution Stages
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                    {pipelineSteps.map((step) => {
                      let statusBadge = (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Circle className="w-2.5 h-2.5" /> Pending
                        </span>
                      );
                      let borderStyle = "border-white/5 bg-[#111827]/40 text-zinc-400";

                      if (step.status === "running") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold animate-pulse">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> In Progress
                          </span>
                        );
                        borderStyle = "border-yellow-500/40 bg-yellow-950/20 text-yellow-200 font-semibold";
                      } else if (step.status === "success") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                          </span>
                        );
                        borderStyle = "border-emerald-500/30 bg-emerald-950/20 text-zinc-300";
                      } else if (step.status === "error") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                            <AlertCircle className="w-2.5 h-2.5" /> Failed
                          </span>
                        );
                        borderStyle = "border-red-500/40 bg-red-950/20 text-red-300";
                      }

                      return (
                        <div
                          key={step.id}
                          className={`p-2.5 rounded-xl border ${borderStyle} flex items-center justify-between gap-2 transition-all`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate font-semibold">{step.name}</span>
                            <span className="text-[10px] text-zinc-500 block truncate">{step.description}</span>
                          </div>
                          <div className="shrink-0">{statusBadge}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Real-time Systematic Execution Log Stream */}
              {thinkingLogs.length > 0 && (
                <div className="space-y-2 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Systematic Backend Execution Stream
                  </span>
                  {thinkingLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-blue-500 font-bold select-none">•</span>
                      <span className="font-mono text-xs">{log.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="flex items-center gap-2 text-blue-400 text-xs italic font-sans animate-pulse pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Executing systematic backend discovery pipeline...</span>
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
