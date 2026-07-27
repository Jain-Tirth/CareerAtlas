"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Target, ShieldCheck, Zap } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface SearchCompletionProps {
  totalScanned: number;
  relevantMatches: number;
  highestAtsScore: number;
  averageMatch: number;
  platformsCount?: number;
}

export default function SearchCompletionCard({
  totalScanned,
  relevantMatches,
  highestAtsScore,
  averageMatch,
  platformsCount = 6,
}: SearchCompletionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" as const }}
      className="bg-gradient-to-br from-blue-950/40 via-[#111827] to-[#09090B] border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Autonomous Search Completed
            </h3>
            <p className="text-xs text-zinc-400">
              Matches ranked via 384-dimensional vector embeddings & ATS heuristics.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          DISCOVERY COMPLETE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#09090B]/60 p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Platforms Scanned</span>
          <div className="text-xl font-extrabold text-white font-mono flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <AnimatedCounter value={platformsCount} />
          </div>
        </div>

        <div className="bg-[#09090B]/60 p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Unique Jobs Scraped</span>
          <div className="text-xl font-extrabold text-white font-mono flex items-center gap-1">
            <Target className="w-4 h-4 text-blue-400" />
            <AnimatedCounter value={totalScanned} />
          </div>
        </div>

        <div className="bg-[#09090B]/60 p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Relevant Matches</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono flex items-center gap-1">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <AnimatedCounter value={relevantMatches} />
          </div>
        </div>

        <div className="bg-[#09090B]/60 p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Highest ATS Score</span>
          <div className="text-xl font-extrabold text-blue-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <AnimatedCounter value={highestAtsScore} suffix="%" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
