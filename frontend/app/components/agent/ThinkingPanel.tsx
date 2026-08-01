"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Cpu, Check, Loader2, AlertCircle } from "lucide-react";

export interface ThinkingStep {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "success" | "error";
  errorDetails?: string;
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isSearching: boolean;
}

export default function ThinkingPanel({ steps, isSearching }: ThinkingPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-[#111827]/60 hover:bg-[#111827] flex items-center justify-between transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-2.5">
          <Cpu className={`w-4 h-4 text-blue-400 ${isSearching ? "animate-pulse" : ""}`} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Agent Thought Process
          </span>
          {isSearching && (
            <span className="text-[10px] bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 px-2 py-0.5 rounded-full font-mono animate-pulse">
              Active Reasoning
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span>{isOpen ? "Collapse" : "Expand"}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 space-y-3 font-mono text-xs"
          >
            {steps.map((step, idx) => {
              let icon = <div className="w-2 h-2 rounded-full bg-zinc-700" />;
              let textColor = "text-zinc-500";

              if (step.status === "running") {
                icon = <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />;
                textColor = "text-yellow-200 font-semibold";
              } else if (step.status === "success") {
                icon = <Check className="w-3.5 h-3.5 text-emerald-400" />;
                textColor = "text-emerald-300";
              } else if (step.status === "error") {
                icon = <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
                textColor = "text-red-300 font-bold";
              }

              return (
                <div key={step.id} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-[1px] bg-zinc-800" />
                  )}

                  <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`${textColor} flex items-center justify-between`}>
                      <span>{step.name}</span>
                      {step.status === "running" && (
                        <span className="text-[10px] text-yellow-400/80 animate-pulse">Thinking...</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{step.description}</div>
                    {step.errorDetails && (
                      <div className="mt-1 p-2 bg-red-950/30 border border-red-900/40 rounded text-[10px] text-red-400 font-mono">
                        Error: {step.errorDetails}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
