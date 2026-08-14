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
      description: "Drop your PDF once to extract raw text and skills instantly.",
      icon: Upload,
    },
    {
      id: "step-2",
      number: "02",
      title: "Skill Analysis",
      subtitle: "Taxonomy & Extraction",
      description: "Extracts exact technical skills, experience depth, and domain expertise to measure true semantic compatibility.",
      icon: Cpu,
    },
    {
      id: "step-3",
      number: "03",
      title: "Matching Engine",
      subtitle: "Multi-Stage Scoring",
      description: "Applies hard filters and similarity scoring against job feeds.",
      icon: GitMerge,
    },
    {
      id: "step-4",
      number: "04",
      title: "Ranked Roles",
      subtitle: "Match Stream",
      description: "Outputs high-fit job opportunities sorted strictly by confidence score.",
      icon: Briefcase,
    },
    {
      id: "step-5",
      number: "05",
      title: "Apply & Alert",
      subtitle: "1-Click Dispatch",
      description: "Direct ATS portal links and instant Telegram notifications.",
      icon: Send,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 bg-transparent relative scroll-mt-24">
      <div id="pipeline" className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-xs font-mono text-[#664930] tracking-wider uppercase font-semibold">
            ARCHITECTURE & WORKFLOW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#664930] tracking-tight mt-3 mb-4 font-sans">
            How It Works
          </h2>
          <p className="text-[#997E67] text-base md:text-lg font-sans">
            An automated, multi-stage ingestion pipeline engineered to surface relevant career opportunities in seconds.
          </p>
        </motion.div>

        {/* Pipeline Progression Steps Grid with Connecting Line & Arrows */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {/* Horizontal Desktop Connecting Progress Line */}
          <div className="hidden lg:block absolute top-[42px] left-[10%] right-[10%] h-[2px] bg-[#CCBEB1] z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <div key={step.id} className="relative z-10 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group flex-1 ${
                    isActive
                      ? "bg-white border-[#664930] shadow-xl scale-[1.02]"
                      : "bg-[#FFFBF7] border-[#CCBEB1] hover:border-[#997E67] hover:bg-white"
                  }`}
                >
                  {/* Desktop Right Connector Arrow Badge */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3.5 top-[34px] w-6 h-6 rounded-full bg-[#FFFBF7] border border-[#CCBEB1] items-center justify-center text-[#997E67] z-20 shadow-2xs">
                      <ArrowRight className="w-3 h-3 text-[#664930]" />
                    </div>
                  )}

                  {/* Step Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#997E67]">{step.number}</span>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-[#664930] text-white shadow-md shadow-[#664930]/20"
                            : "bg-[#FFDBBB] text-[#664930] group-hover:bg-[#664930] group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#664930] mb-1 font-sans">{step.title}</h3>
                    <span className="text-[11px] font-mono text-[#997E67] block mb-3">{step.subtitle}</span>

                    <p className="text-xs text-[#997E67] leading-relaxed font-sans">{step.description}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Active Step Summary Box */}
        {/* <motion.div
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
        </motion.div> */}
      </div>
    </section>
  );
}
