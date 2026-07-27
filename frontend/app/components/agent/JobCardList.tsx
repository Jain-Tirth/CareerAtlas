"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Calendar, ExternalLink, CheckCircle2, AlertTriangle, Sparkles, Trash2, RefreshCw } from "lucide-react";

export interface JobResult {
  id: number;
  jobId: string;
  company: string;
  title: string;
  location: string;
  source: string;
  url?: string;
  score: number;
  reasoning: string;
  status: string;
  createdAt: string;
  confidenceScore?: number;
  confidenceFactors?: {
    positive: string[];
    negative: string[];
  } | string;
}

interface JobCardListProps {
  jobs: JobResult[];
  isLoading: boolean;
  onClearHistory: () => void;
  onRefresh: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

export default function JobCardList({
  jobs,
  isLoading,
  onClearHistory,
  onRefresh,
}: JobCardListProps) {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Ranked Opportunities ({jobs.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Evaluated via multi-stage hard filters, skill alias expansion, and cosine similarity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearHistory}
            disabled={isLoading}
            className="text-xs bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cache
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm text-zinc-500 font-mono">Retrieving ranked job results...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-center">
          <Sparkles className="w-10 h-10 text-zinc-700 mb-3" />
          <span className="text-sm text-zinc-400 font-semibold">No recommendation results found yet</span>
          <span className="text-xs text-zinc-500 mt-1 max-w-sm">
            Select or upload a resume version above and click "Start Agent Search" to populate recommendations.
          </span>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {jobs.map((item) => {
            const confScore = item.confidenceScore !== undefined && item.confidenceScore !== null ? item.confidenceScore : item.score;
            
            let factors: { positive: string[]; negative: string[] } = { positive: [], negative: [] };
            if (item.confidenceFactors) {
              try {
                factors = typeof item.confidenceFactors === "string" 
                  ? JSON.parse(item.confidenceFactors) 
                  : item.confidenceFactors;
              } catch {}
            }

            let fitText = "Moderate Match";
            let scoreColor = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
            if (confScore >= 80) {
              fitText = "Strong Match";
              scoreColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
            } else if (confScore >= 65) {
              fitText = "Good Match";
              scoreColor = "bg-blue-500/10 border-blue-500/30 text-blue-400";
            }

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="bg-[#111827]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold text-zinc-400 truncate mt-0.5">
                        {item.company}
                      </p>
                    </div>

                    <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-extrabold font-mono flex items-center justify-center gap-1 ${scoreColor}`}>
                      <span>{fitText}</span>
                      <span className="text-[10px] opacity-70">({confScore}%)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 border-b border-white/5 pb-3 mb-4 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.reasoning && (
                    <div className="mb-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        AI Fit Reasoning
                      </span>
                      <p className="bg-[#09090B]/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-300 italic leading-relaxed">
                        "{item.reasoning}"
                      </p>
                    </div>
                  )}

                  {((factors.positive && factors.positive.length > 0) || (factors.negative && factors.negative.length > 0)) && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Confidence Factors
                      </span>
                      {factors.positive?.map((p: string, idx: number) => (
                        <div key={`pos-${idx}`} className="flex items-start gap-1.5 text-[11px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                      {factors.negative?.map((n: string, idx: number) => (
                        <div key={`neg-${idx}`} className="flex items-start gap-1.5 text-[11px] text-yellow-400 font-mono">
                          <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-end">
                  {item.url && (item.url.startsWith("http://") || item.url.startsWith("https://")) ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      Apply directly
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600 italic font-mono">No direct link</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
