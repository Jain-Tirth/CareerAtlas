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
    <div className="bg-white border border-[#CCBEB1] rounded-2xl overflow-hidden shadow-md font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-[#FFFBF7] hover:bg-[#FFDBBB]/40 flex items-center justify-between transition-colors border-b border-[#CCBEB1]/60 font-sans"
      >
        <div className="flex items-center gap-2.5">
          <Cpu className={`w-4 h-4 text-[#664930] ${isSearching ? "animate-pulse" : ""}`} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#664930]">
            Agent Thought Process
          </span>
          {isSearching && (
            <span className="text-[10px] bg-[#FFDBBB] border border-[#CCBEB1] text-[#664930] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
              Active Reasoning
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#997E67]">
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
              let icon = <div className="w-2 h-2 rounded-full bg-[#CCBEB1]" />;
              let textColor = "text-[#997E67]";

              if (step.status === "running") {
                icon = <Loader2 className="w-3.5 h-3.5 text-[#664930] animate-spin" />;
                textColor = "text-[#664930] font-bold";
              } else if (step.status === "success") {
                icon = <Check className="w-3.5 h-3.5 text-[#664930]" />;
                textColor = "text-[#664930] font-semibold";
              } else if (step.status === "error") {
                icon = <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
                textColor = "text-red-700 font-bold";
              }

              return (
                <div key={step.id} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-[1px] bg-[#CCBEB1]" />
                  )}

                  <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`${textColor} flex items-center justify-between`}>
                      <span>{step.name}</span>
                      {step.status === "running" && (
                        <span className="text-[10px] text-[#664930] animate-pulse font-bold">Thinking...</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#997E67] mt-0.5">{step.description}</div>
                    {step.errorDetails && (
                      <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-700 font-mono">
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
