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
      className="bg-white border border-[#CCBEB1] rounded-2xl p-6 shadow-md space-y-5 font-sans"
    >
      <div className="flex items-center justify-between border-b border-[#CCBEB1] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center text-[#664930]">
            <Sparkles className="w-4 h-4 text-[#664930]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#664930] tracking-tight font-sans">
              Autonomous Search Completed
            </h3>
            <p className="text-xs text-[#997E67] font-sans">
              Matches ranked via 384-dimensional vector embeddings & ATS heuristics.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-[#FFDBBB] border border-[#CCBEB1] text-[#664930] text-xs font-mono font-bold px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#664930] animate-pulse" />
          DISCOVERY COMPLETE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFBF7] p-4 rounded-xl border border-[#CCBEB1] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#997E67] block">Platforms Scanned</span>
          <div className="text-xl font-extrabold text-[#664930] font-mono flex items-center gap-1">
            <Zap className="w-4 h-4 text-[#664930]" />
            <AnimatedCounter value={platformsCount} />
          </div>
        </div>

        <div className="bg-[#FFFBF7] p-4 rounded-xl border border-[#CCBEB1] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#997E67] block">Unique Jobs Scraped</span>
          <div className="text-xl font-extrabold text-[#664930] font-mono flex items-center gap-1">
            <Target className="w-4 h-4 text-[#664930]" />
            <AnimatedCounter value={totalScanned} />
          </div>
        </div>

        <div className="bg-[#FFFBF7] p-4 rounded-xl border border-[#CCBEB1] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#997E67] block">Relevant Matches</span>
          <div className="text-xl font-extrabold text-[#664930] font-mono flex items-center gap-1">
            <Trophy className="w-4 h-4 text-[#664930]" />
            <AnimatedCounter value={relevantMatches} />
          </div>
        </div>

        <div className="bg-[#FFFBF7] p-4 rounded-xl border border-[#CCBEB1] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#997E67] block">Highest ATS Score</span>
          <div className="text-xl font-extrabold text-[#664930] font-mono flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#664930]" />
            <AnimatedCounter value={highestAtsScore} suffix="%" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
