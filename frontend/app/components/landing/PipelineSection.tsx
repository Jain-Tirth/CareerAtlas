"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, GitMerge, Briefcase, Send, ArrowRight } from "lucide-react";

export function PipelineSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "step-1",
      number: "01",
      title: "Upload Resume",
      subtitle: "PDF Ingestion",
      description: "Drop your PDF resume once. Raw text, bullet points, and achievements are extracted securely without manual data entry.",
      icon: Upload,
      metrics: "Sub-second parsing",
    },
    {
      id: "step-2",
      number: "02",
      title: "AI Profile Extraction",
      subtitle: "Taxonomy & Vectorization",
      description: "Extracts core skills, tech stack, work experience years, education, and project impacts into structured JSON and 384-dim embeddings.",
      icon: Cpu,
      metrics: "Zero keyword loss",
    },
    {
      id: "step-3",
      number: "03",
      title: "Matching Engine",
      subtitle: "Multi-Stage Scoring",
      description: "Runs hard location/remote criteria filters, synonym alias dictionaries, and vector cosine similarity scoring across ingested job feeds.",
      icon: GitMerge,
      metrics: "Hard filter precision",
    },
    {
      id: "step-4",
      number: "04",
      title: "Relevant Jobs",
      subtitle: "Ranked Stream",
      description: "Generates a clean list of top matching roles ranked strictly by confidence fit percentage, with positive/negative match factors explained.",
      icon: Briefcase,
      metrics: "Filtered fit scores ≥ 80%",
    },
    {
      id: "step-5",
      number: "05",
      title: "Apply & Alert",
      subtitle: "1-Click Action & Alerts",
      description: "Direct links to company ATS portals and instant Telegram notifications for top-tier opportunities matching your profile.",
      icon: Send,
      metrics: "Real-time dispatch",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-transparent border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-mono text-[#2563EB] tracking-wider uppercase font-semibold">
            ARCHITECTURE & WORKFLOW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            An automated, multi-stage ingestion pipeline engineered to surface relevant career opportunities in seconds.
          </p>
        </motion.div>

        {/* Pipeline Progression Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group backdrop-blur-md ${
                  isActive
                    ? "bg-[#111827]/90 border-[#2563EB] shadow-xl card-glow-blue scale-[1.02]"
                    : "bg-[#111827]/40 border-white/5 hover:border-white/20 hover:bg-[#111827]/70"
                }`}
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-zinc-500">{step.number}</span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30"
                          : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                  <span className="text-[11px] font-mono text-zinc-500 block mb-3">{step.subtitle}</span>

                  <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Step Footer Metric Badge */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>{step.metrics}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? "text-[#2563EB] translate-x-1" : "text-zinc-600"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Step Summary Box */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 p-6 rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl card-glow-blue"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center shrink-0">
              {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-[#2563EB]" })}
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                ACTIVE STAGE: STEP {steps[activeStep].number}
              </span>
              <h4 className="text-lg font-bold text-white">{steps[activeStep].title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{steps[activeStep].description}</p>
            </div>
          </div>

          <a
            href="/dashboard"
            className="shrink-0 bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all btn-glow-blue flex items-center gap-2"
          >
            <span>Test Stage in App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
