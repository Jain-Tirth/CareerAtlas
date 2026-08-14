"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, ArrowRight, Layers, Sliders, History, FileSearch, Sparkles, Kanban, Globe, FileCheck } from "lucide-react";

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["0 0.95", "0.2 0.7"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0.3, 1]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.2], ["blur(8px)", "blur(0px)"]);
  const headerY = useTransform(scrollYProgress, [0, 0.2], [16, 0]);

  return (
    <section ref={sectionRef} id="features" className="py-12 bg-transparent space-y-12 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header with 50% Scroll Blur Reveal */}
        <motion.div
          style={{
            opacity: headerOpacity,
            filter: headerBlur,
            y: headerY,
          }}
          className="text-center max-w-3xl mx-auto mb-20 transition-all duration-300"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4 text-[#664930] font-sans">
            Built for precision, not guesswork.
          </h2>
          <p className="text-[#997E67] text-base md:text-lg font-sans">
            Every feature is designed to replace broad job search noise with deterministic resume evaluation.
          </p>
        </motion.div>

        {/* Feature 1: Resume Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-3xl font-extrabold text-[#664930] tracking-tight font-sans">
              Multi-Stage Resume Matching
            </h3>

            <p className="text-[#997E67] text-sm leading-relaxed font-sans">
              CareerAtlas doesn't rely on basic keyword matching. It converts candidate profiles and job requirements into 384-dimension vector embeddings to measure true semantic compatibility.
            </p>

            <ul className="space-y-3 text-xs text-[#664930] font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Hard constraint checks (Location, Remote policy, Seniority requirements)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Synonym dictionary for technical skill aliases (e.g. React.js = React)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Confidence analysis with explicit positive and negative match factors</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFBF7] border border-[#CCBEB1] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]">
              <span className="text-xs font-mono text-[#997E67]">Match Analysis Output</span>
              <span className="text-xs font-mono text-[#664930] bg-[#FFDBBB] px-2.5 py-0.5 rounded border border-[#CCBEB1] font-bold">
                Score: 94 / 100
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#CCBEB1] space-y-3">
              <div className="text-sm font-bold text-[#664930] font-sans">Senior Staff Product Engineer @ Stripe</div>
              <p className="text-xs text-[#997E67] font-sans">"Match Confidence: 94%. Candidate's background in distributed Node.js services and PostgreSQL query tuning aligns with Stripe Core Infrastructure needs."</p>

              <div className="space-y-1.5 pt-2 text-[11px] font-mono">
                <div className="text-[#664930] font-bold">✓ Positive: 5+ years experience in distributed backend engineering</div>
                <div className="text-[#664930] font-bold">✓ Positive: Verified skills match in TypeScript, Redis, PostgreSQL</div>
                <div className="text-[#997E67]">⚠ Negative: Requires Go experience (listed as secondary skill in profile)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Resume Parsing & Taxonomy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-7 order-2 lg:order-1 p-6 rounded-2xl bg-[#FFFBF7] border border-[#CCBEB1] shadow-xl space-y-4 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]">
              <span className="text-xs font-mono text-[#997E67]">Extracted Candidate Profile Taxonomy</span>
              <span className="text-xs font-mono text-[#664930] font-bold">PDF Ingested</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#CCBEB1]">
                <span className="text-[#997E67] font-mono block text-[10px] uppercase mb-1">Target Roles</span>
                <span className="font-bold text-[#664930]">Senior Full-Stack Engineer</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#CCBEB1]">
                <span className="text-[#997E67] font-mono block text-[10px] uppercase mb-1">Experience Level</span>
                <span className="font-bold text-[#664930]">5+ Years (Mid-Senior)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#CCBEB1]">
              <span className="text-[#997E67] font-mono block text-[10px] uppercase mb-2">Extracted Core Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "FastEmbed"].map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-[#FFDBBB] text-[#664930] text-xs font-mono font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFDBBB] border border-[#CCBEB1] text-xs font-mono text-[#664930] font-bold">
              <FileSearch className="w-3.5 h-3.5" />
              <span>TAXONOMY ENGINE</span>
            </div>

            <h3 className="text-3xl font-extrabold text-[#664930] tracking-tight font-sans">
              Structured Resume Extraction
            </h3>

            <p className="text-[#997E67] text-sm leading-relaxed font-sans">
              PDF resumes are parsed into technical taxonomies, extracting skills, work tenure, and key project metrics automatically.
            </p>

            <ul className="space-y-3 text-xs text-[#664930] font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Extracts competencies without manual data entry</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Normalizes experience level across companies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Resume Version Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFDBBB] border border-[#CCBEB1] text-xs font-mono text-[#664930] font-bold">
              <History className="w-3.5 h-3.5" />
              <span>VERSION MANAGEMENT</span>
            </div>

            <h3 className="text-3xl font-extrabold text-[#664930] tracking-tight font-sans">
              Resume Version History
            </h3>

            <p className="text-[#997E67] text-sm leading-relaxed font-sans">
              Maintain multiple resume variations (e.g. Frontend vs. Full-Stack) and evaluate matching performance across versions.
            </p>

            <ul className="space-y-3 text-xs text-[#664930] font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Store role-specific resume variations safely</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#664930] shrink-0 mt-0.5" />
                <span>Track match score differences across versions</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFBF7] border border-[#CCBEB1] shadow-xl space-y-4 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]">
              <span className="text-xs font-mono text-[#997E67]">Resume Version Vault</span>
              <span className="text-xs font-mono text-[#664930] font-bold">2 Versions Active</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#664930] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#664930] flex items-center gap-2">
                    Resume_Frontend_Lead.pdf
                    <span className="text-[10px] bg-[#FFDBBB] text-[#664930] px-2 py-0.5 rounded font-mono font-bold">PRIMARY</span>
                  </div>
                  <span className="text-[#997E67] text-[11px] mt-0.5 block">Target: Senior Frontend Engineer • 94% Match</span>
                </div>
                <span className="text-[#664930] font-mono font-bold">v1.2</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#CCBEB1] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#664930]">Resume_FullStack_Core.pdf</div>
                  <span className="text-[#997E67] text-[11px] mt-0.5 block">Target: Full-Stack Architect • 88% Match</span>
                </div>
                <span className="text-[#997E67] font-mono">v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
