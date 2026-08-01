"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, Globe } from "lucide-react";

export interface PlatformProgress {
  id: string;
  name: string;
  source: string;
  status: "waiting" | "searching" | "completed" | "failed";
  count: number;
  progressPercent: number;
}

interface PlatformStatusProps {
  platforms: PlatformProgress[];
  isSearching: boolean;
}

export default function PlatformStatusProgress({
  platforms,
  isSearching,
}: PlatformStatusProps) {
  if (!isSearching && platforms.every((p) => p.status === "waiting")) {
    return null;
  }

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Parallel Job Board Discovery Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-blue-950/60 border border-blue-800/40 text-blue-400 px-2 py-0.5 rounded-full">
          6 PLATFORMS CONCURRENT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {platforms.map((platform) => {
          let statusBadge = (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
              <Clock className="w-3 h-3" /> Waiting
            </span>
          );
          let barBg = "bg-zinc-800";
          let progressBg = "bg-zinc-600";

          if (platform.status === "searching") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400 font-semibold">
                <Loader2 className="w-3 h-3 animate-spin text-yellow-400" /> Searching...
              </span>
            );
            progressBg = "bg-gradient-to-r from-blue-500 to-yellow-400 animate-pulse";
          } else if (platform.status === "completed") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {platform.count} Jobs
              </span>
            );
            progressBg = "bg-emerald-500";
          } else if (platform.status === "failed") {
            statusBadge = (
              <span className="text-[10px] font-mono text-red-400 font-semibold">
                Error
              </span>
            );
            progressBg = "bg-red-500";
          }

          return (
            <div
              key={platform.id}
              className="bg-[#09090B]/60 border border-white/5 rounded-xl p-3 space-y-2 transition-all hover:border-white/10"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">{platform.name}</span>
                {statusBadge}
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${progressBg} rounded-full`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${platform.progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
