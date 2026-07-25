"use client";

import React from "react";
import { Check, ArrowRight, Layers, Sliders, History, FileSearch, Sparkles, Kanban, Globe, FileCheck } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-transparent space-y-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono text-[#2563EB] tracking-wider uppercase font-semibold">
            ENGINEERING CAPABILITIES
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-3 mb-4">
            Built for precision, not guesswork.
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Every feature is designed to replace broad job search noise with deterministic resume evaluation.
          </p>
        </div>

        {/* Feature 1: Resume Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/80 backdrop-blur-md border border-white/10 text-xs font-mono text-[#2563EB]">
              <Sliders className="w-3.5 h-3.5" />
              <span>CORE MATCH ENGINE</span>
            </div>

            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Multi-Stage Resume Matching
            </h3>

            <p className="text-zinc-400 text-sm leading-relaxed">
              CareerAtlas doesn't rely on basic keyword matching. It converts candidate profiles and job requirements into 384-dimension vector embeddings to measure true semantic compatibility.
            </p>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Hard constraint checks (Location, Remote policy, Seniority requirements)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Synonym dictionary for technical skill aliases (e.g. React.js = React)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Confidence analysis with explicit positive and negative match factors</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-white/10 shadow-2xl card-glow-blue space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono text-zinc-400">Match Analysis Output</span>
              <span className="text-xs font-mono text-[#10B981] bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Score: 94 / 100
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B]/80 border border-white/5 space-y-3">
              <div className="text-sm font-bold text-white">Senior Staff Product Engineer @ Stripe</div>
              <p className="text-xs text-zinc-400">"Match Confidence: 94%. Candidate's background in distributed Node.js services and PostgreSQL query tuning aligns with Stripe Core Infrastructure needs."</p>

              <div className="space-y-1.5 pt-2 text-[11px] font-mono">
                <div className="text-emerald-400">✓ Positive: 5+ years experience in distributed backend engineering</div>
                <div className="text-emerald-400">✓ Positive: Verified skills match in TypeScript, Redis, PostgreSQL</div>
                <div className="text-amber-400">⚠ Negative: Requires Go experience (listed as secondary skill in profile)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Resume Parsing & Taxonomy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-7 order-2 lg:order-1 p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-white/10 shadow-2xl card-glow-blue space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono text-zinc-400">Extracted Candidate Profile Taxonomy</span>
              <span className="text-xs font-mono text-zinc-500">PDF Ingested</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#09090B]/80 border border-white/5">
                <span className="text-zinc-500 font-mono block text-[10px] uppercase mb-1">Target Roles</span>
                <span className="font-semibold text-white">Senior Full-Stack Engineer</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#09090B]/80 border border-white/5">
                <span className="text-zinc-500 font-mono block text-[10px] uppercase mb-1">Experience Level</span>
                <span className="font-semibold text-white">5+ Years (Mid-Senior)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090B]/80 border border-white/5">
              <span className="text-zinc-500 font-mono block text-[10px] uppercase mb-2">Extracted Core Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "React 19", "Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "TailwindCSS", "FastEmbed"].map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/80 backdrop-blur-md border border-white/10 text-xs font-mono text-[#2563EB]">
              <FileSearch className="w-3.5 h-3.5" />
              <span>TAXONOMY ENGINE</span>
            </div>

            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Structured Resume Extraction
            </h3>

            <p className="text-zinc-400 text-sm leading-relaxed">
              PDF resumes are parsed instantly into structured technical taxonomies. CareerAtlas identifies work history, tech stacks, framework versions, and project metrics automatically.
            </p>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Extracts core competencies without manual form filling</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Normalizes experience level and tenure across companies</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Extracts project impact bullets and key tech stacks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Resume Version Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/80 backdrop-blur-md border border-white/10 text-xs font-mono text-[#2563EB]">
              <History className="w-3.5 h-3.5" />
              <span>VERSION MANAGEMENT</span>
            </div>

            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Resume Version History
            </h3>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Targeting different roles? Maintain multiple resume variations (e.g. Frontend Specialist vs. Full Stack Engineer) and evaluate matching performance across versions.
            </p>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Store role-specific resume variations safely</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Track match score differences across resume versions</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-white/10 shadow-2xl card-glow-blue space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono text-zinc-400">Resume Version Vault</span>
              <span className="text-xs font-mono text-zinc-500">2 Versions Active</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#09090B]/80 border border-[#2563EB]/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    Resume_Frontend_Lead.pdf
                    <span className="text-[10px] bg-[#2563EB]/20 text-[#2563EB] px-2 py-0.5 rounded font-mono">PRIMARY</span>
                  </div>
                  <span className="text-zinc-500 text-[11px] mt-0.5 block">Target: Senior Frontend / UI Engineer • 94% Avg Match</span>
                </div>
                <span className="text-zinc-400 font-mono">v1.2</span>
              </div>

              <div className="p-4 rounded-xl bg-[#09090B]/80 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-300">Resume_FullStack_Core.pdf</div>
                  <span className="text-zinc-500 text-[11px] mt-0.5 block">Target: Full-Stack / Node.js Architect • 88% Avg Match</span>
                </div>
                <span className="text-zinc-400 font-mono">v1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Future Modules Section Spotlight */}
        <div className="pt-16 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase font-semibold">UPCOMING ROADMAP MODULES</span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-2">Future Product Suite</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#111827]/60 backdrop-blur-md border border-white/5 space-y-3 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB]">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">ATS Score Analyzer</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Check keyword coverage and formatting compatibility against employer ATS systems.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827]/60 backdrop-blur-md border border-white/5 space-y-3 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Resume Optimization</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Line-by-line bullet rewrites tailored specifically to target job descriptions.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827]/60 backdrop-blur-md border border-white/5 space-y-3 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB]">
                <Kanban className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Application Tracker</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">TealHQ-style Kanban board to manage applied, interviewing, and offer stages.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827]/60 backdrop-blur-md border border-white/5 space-y-3 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB]">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Chrome Extension</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">One-click save and match score evaluation directly on LinkedIn and Greenhouse tabs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
