"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, ArrowUpRight, Filter } from "lucide-react";

export function ProductMockup() {
  const [activeTab, setActiveTab] = useState<"matches" | "taxonomy" | "logs">("matches");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="relative w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#111827]/90 backdrop-blur-xl shadow-2xl shadow-black/90 overflow-hidden text-left group"
    >
      {/* Subtle Glowing Border Ring Effect */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#2563EB]/30 via-transparent to-[#10B981]/30 opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none blur-sm" />

      {/* Window Titlebar */}
      <div className="relative z-10 h-11 px-4 border-b border-white/10 bg-[#09090B]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
          <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
          <div className="w-3 h-3 rounded-full bg-zinc-700/80" />
          <span className="ml-2 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            careeratlas.app/dashboard
          </span>
        </div>

        {/* Animated Tab Controls */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-lg border border-white/5 text-xs font-medium text-zinc-400">
          {[
            { id: "matches", label: "Live Matches (94% Fit)" },
            { id: "taxonomy", label: "Resume Taxonomy" },
            { id: "logs", label: "Pipeline Stream" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-1 rounded-md transition-colors duration-200 z-10 ${
                  isActive ? "text-white font-semibold" : "hover:text-zinc-200 text-zinc-400"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#2563EB] rounded-md -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interface Canvas with Animated Tab Content */}
      <div className="relative z-10 p-6 md:p-8 bg-[#09090B]/60 min-h-[420px]">
        <AnimatePresence mode="wait">
          {activeTab === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Filter Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#111827] border border-white/5 text-xs text-zinc-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                    <Filter className="w-3.5 h-3.5 text-[#2563EB]" /> Active Filters:
                  </span>
                  <span className="bg-zinc-800 text-zinc-200 px-2.5 py-1 rounded-md font-mono">Role: Full-Stack Engineer</span>
                  <span className="bg-zinc-800 text-zinc-200 px-2.5 py-1 rounded-md font-mono">Location: Remote / SF</span>
                  <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-2.5 py-1 rounded-md font-mono">
                    Min Match Score: ≥ 80%
                  </span>
                </div>
                <span className="text-zinc-500 font-mono text-[11px]">Updated 2 mins ago • 14 verified results</span>
              </div>

              {/* Job Cards Stream */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 */}
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-5 rounded-xl bg-[#111827] border border-white/10 hover:border-[#2563EB]/50 transition-all duration-200 group/card shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white group-hover/card:text-[#2563EB] transition-colors flex items-center gap-2">
                        Senior Frontend Architect
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover/card:text-[#2563EB] transition-colors" />
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium">Linear • Remote (US / Europe)</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-sm">
                      96% Match
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    "Candidate's deep Next.js, TypeScript, and micro-frontend state architecture aligns 98% with position requirements."
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Exact tech stack match: React 19, TypeScript, Next.js App Router</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>5+ years senior frontend experience verified</span>
                    </div>
                  </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-5 rounded-xl bg-[#111827] border border-white/10 hover:border-[#2563EB]/50 transition-all duration-200 group/card shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white group-hover/card:text-[#2563EB] transition-colors flex items-center gap-2">
                        Staff Product Engineer
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover/card:text-[#2563EB] transition-colors" />
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium">Vercel • San Francisco / Remote</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-sm">
                      92% Match
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    "Strong experience in developer tooling, Web Vitals optimization, and real-time streaming architectures."
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Proven experience building modern developer tools</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Requires GraphQL experience (listed as secondary skill)</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "taxonomy" && (
            <motion.div
              key="taxonomy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="p-4 rounded-xl bg-[#111827] border border-white/5 space-y-3">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                  Core Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["TypeScript", "React 19", "Next.js", "Node.js", "TailwindCSS", "PostgreSQL", "Redis", "Vector DBs", "Docker"].map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-white/5 space-y-3">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                  Seniority & Experience
                </span>
                <div className="text-sm font-bold text-white">Senior Lead Engineer</div>
                <div className="text-xs text-zinc-400">5+ years total work experience across full-stack & web applications.</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-white/5 space-y-3">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                  Project Taxonomy
                </span>
                <div className="text-xs text-zinc-300 font-semibold">Autonomous Job Matching Engine</div>
                <div className="text-[11px] text-zinc-500">Built multi-agent ingestion pipeline processing 10k+ postings daily with 384-dim embeddings.</div>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-4 rounded-xl bg-black/90 border border-white/10 font-mono text-xs text-zinc-300 space-y-2 leading-relaxed"
            >
              <div className="text-emerald-400">[21:30:12] Pipeline step 1: PDF resume parsed (1,420 tokens extracted)</div>
              <div className="text-blue-400">[21:30:13] Pipeline step 2: 384-dim candidate embedding generated via FastEmbed</div>
              <div className="text-zinc-400">[21:30:14] Pipeline step 3: Crawling Greenhouse & Lever job boards for 'Full-Stack Engineer'...</div>
              <div className="text-zinc-400">[21:30:16] Pipeline step 4: 142 raw listings fetched. Running hard location & remote filters...</div>
              <div className="text-[#10B981]">[21:30:18] Pipeline step 5: Match engine evaluated 38 listings ≥ 80% cosine vector similarity score</div>
              <div className="text-amber-400">[21:30:19] Pipeline step 6: Dispatched 2 top alerts to Telegram</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
