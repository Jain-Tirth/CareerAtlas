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
    ? [`${currentRunningStep.name}`]
    : thinkingLogs.length > 0
    ? thinkingLogs.map((l) => l.text)
    : ["Systematic Profile Embedding...", "Scraper Ingestion Suite...", "Cosine Similarity Math..."];

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Systematic AI Thinking Block */}
      <div className="bg-white border border-[#CCBEB1] rounded-2xl overflow-hidden shadow-md transition-all font-sans">
        {/* Thinking Header Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#FFFBF7] transition-colors border-b border-[#CCBEB1]/60 font-sans"
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-6 h-6 rounded-lg bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center text-[#664930] shrink-0">
              <Brain className={`w-3.5 h-3.5 text-[#664930] ${isSearching ? "animate-pulse" : ""}`} />
            </div>

            <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
              {isSearching ? (
                <>
                  <span className="text-[#664930] font-bold shrink-0">
                    Thinking for {formatTimer(elapsedSeconds)}
                  </span>
                  <span className="text-[#997E67] select-none">•</span>
                  <TextLoop
                    items={headerLoopTexts}
                    intervalMs={2200}
                    className="text-[#664930] font-semibold text-xs truncate max-w-xs sm:max-w-md font-sans"
                  />
                </>
              ) : (
                <>
                  <span className="text-[#664930] font-bold">Thought for {formatTimer(elapsedSeconds)}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#664930] shrink-0" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#997E67] font-mono shrink-0">
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
              className="p-5 bg-[#FFFBF7] space-y-5 border-t border-[#CCBEB1]/60 font-sans"
            >
              {/* Systematic Pipeline Execution Timeline */}
              {pipelineSteps.length > 0 && (
                <div className="space-y-3 pb-4 border-b border-[#CCBEB1]/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                    {pipelineSteps.map((step) => {
                      let statusBadge = (
                        <span className="flex items-center gap-1 text-[10px] text-[#997E67]">
                          <Circle className="w-2.5 h-2.5" /> Waiting
                        </span>
                      );
                      let borderStyle = "border-[#CCBEB1] bg-white text-[#997E67]";

                      if (step.status === "running") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-[#664930] font-bold animate-pulse">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> In Progress
                          </span>
                        );
                        borderStyle = "border-[#664930] bg-[#FFDBBB]/50 text-[#664930] font-bold";
                      } else if (step.status === "success") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-[#664930] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#664930]" /> Completed
                          </span>
                        );
                        borderStyle = "border-[#CCBEB1] bg-white text-[#664930]";
                      } else if (step.status === "error") {
                        statusBadge = (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
                            <AlertCircle className="w-2.5 h-2.5" /> Failed
                          </span>
                        );
                        borderStyle = "border-red-300 bg-red-50 text-red-700";
                      }

                      return (
                        <div
                          key={step.id}
                          className={`p-2.5 rounded-xl border ${borderStyle} flex items-center justify-between gap-2 transition-all font-sans`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate font-bold text-[#664930]">{step.name}</span>
                          </div>
                          <div className="shrink-0">{statusBadge}</div>
                        </div>
                      );
                    })}
                  </div>
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
          className="bg-white border border-[#CCBEB1] rounded-2xl p-5 shadow-md flex items-start gap-3.5 font-sans"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center text-[#664930] shrink-0">
            <Sparkles className="w-4 h-4 text-[#664930]" />
          </div>
          <div className="space-y-1 text-xs font-sans">
            <span className="font-mono text-[10px] uppercase font-bold text-[#664930] block">
              CareerAtlas Assistant
            </span>
            <p className="text-[#664930] text-sm leading-relaxed font-medium font-sans">
              {finalResponse}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
