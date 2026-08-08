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
    <div className="bg-white border border-[#CCBEB1] rounded-2xl p-5 shadow-md space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-[#CCBEB1]/60 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#664930] animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#664930]">
            Parallel Job Board Discovery Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-[#FFDBBB] border border-[#CCBEB1] text-[#664930] font-bold px-2 py-0.5 rounded-full">
          6 PLATFORMS CONCURRENT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-sans">
        {platforms.map((platform) => {
          let statusBadge = (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#997E67]">
              <Clock className="w-3 h-3" /> Waiting
            </span>
          );
          let progressBg = "bg-[#CCBEB1]";

          if (platform.status === "searching") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#664930] font-bold">
                <Loader2 className="w-3 h-3 animate-spin text-[#664930]" /> Searching...
              </span>
            );
            progressBg = "bg-[#FFDBBB] animate-pulse";
          } else if (platform.status === "completed") {
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#664930] font-bold">
                <CheckCircle2 className="w-3 h-3 text-[#664930]" /> {platform.count} Jobs
              </span>
            );
            progressBg = "bg-[#664930]";
          } else if (platform.status === "failed") {
            statusBadge = (
              <span className="text-[10px] font-mono text-red-600 font-bold">
                Error
              </span>
            );
            progressBg = "bg-red-500";
          }

          return (
            <div
              key={platform.id}
              className="bg-[#FFFBF7] border border-[#CCBEB1] rounded-xl p-3 space-y-2 transition-all hover:border-[#664930]"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#664930]">{platform.name}</span>
                {statusBadge}
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-white border border-[#CCBEB1]/60 rounded-full overflow-hidden">
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
