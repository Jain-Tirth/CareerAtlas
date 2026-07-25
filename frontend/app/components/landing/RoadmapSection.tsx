"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar } from "lucide-react";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 bg-transparent border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#2563EB] tracking-wider uppercase font-semibold">
            ENGINEERING TIMELINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-3 mb-4">
            Product Roadmap
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Our transparent timeline for core pipeline features, intelligent tailoring, and browser extensions.
          </p>
        </div>

        {/* Roadmap Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Column 1: Current (Live) */}
          <div className="p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-emerald-500/30 flex flex-col justify-between relative shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  CURRENT (LIVE)
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                  v1.0 Release
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Autonomous Scraper Ingestion</h4>
                  <p className="text-xs text-zinc-400">Concurrent crawling across LinkedIn, Greenhouse, Lever, and TinyFish API.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Multi-Stage Vector Engine</h4>
                  <p className="text-xs text-zinc-400">384-dimension vector embeddings using FastEmbed and Qdrant/pgvector.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Structured PDF Resume Parsing</h4>
                  <p className="text-xs text-zinc-400">Instant extraction of skills, experience, project tech stacks, and education.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Telegram Alerts & Reasoning</h4>
                  <p className="text-xs text-zinc-400">Real-time alerts sent to Telegram with positive and negative confidence factors.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
              Status: Fully Deployed & Active
            </div>
          </div>

          {/* Column 2: Upcoming (Q3 2026) */}
          <div className="p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-[#2563EB]/40 flex flex-col justify-between relative shadow-xl card-glow-blue">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-mono font-bold text-[#2563EB] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  UPCOMING
                </span>
                <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                  Q3 2026
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Resume Version Manager</h4>
                  <p className="text-xs text-zinc-400">Store and compare multiple targeted resume variations for different role types.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Real-Time ATS Score Analyzer</h4>
                  <p className="text-xs text-zinc-400">Deterministic ATS keyword coverage score before submitting applications.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Interactive Resume Optimization</h4>
                  <p className="text-xs text-zinc-400">AI-driven bullet rewrites aligned with specific job descriptions.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
              Status: In Active Development
            </div>
          </div>

          {/* Column 3: Future Roadmap */}
          <div className="p-6 rounded-2xl bg-[#111827]/60 backdrop-blur-md border border-white/5 flex flex-col justify-between relative shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  FUTURE ROADMAP
                </span>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                  Q4 2026+
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Application Tracker (TealHQ-style)</h4>
                  <p className="text-xs text-zinc-400">Visual Kanban board tracking Applied, Interview, Offer, and Rejected stages.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Chrome Extension V2</h4>
                  <p className="text-xs text-zinc-400">One-click job saving and match scoring directly on browser job pages.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Automated Browser Apply Agent</h4>
                  <p className="text-xs text-zinc-400">Autonomous form pre-fill for common ATS application portals.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
              Status: Planned Architecture
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
