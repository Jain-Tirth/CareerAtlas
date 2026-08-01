"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-white/5 text-center">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#2563EB]/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6">
        <div className="p-10 md:p-16 rounded-3xl bg-[#111827]/80 backdrop-blur-md border border-white/10 shadow-2xl card-glow-blue relative overflow-hidden">
          <span className="text-xs font-mono text-[#2563EB] tracking-wider uppercase font-semibold block mb-4">
            START DISCOVERING MATCHES TODAY
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight mb-6">
            Stop searching thousands of irrelevant jobs.
          </h2>

          <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Upload your resume once and let CareerAtlas continuously surface recommendations that fit your exact skills and experience.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-500 text-white text-base font-semibold px-9 py-4 rounded-xl transition-all duration-200 btn-glow-blue overflow-hidden"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
