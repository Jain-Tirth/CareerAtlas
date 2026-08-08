"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-[#CCBEB1] text-center">
      <div className="max-w-4xl mx-auto px-6">
        <div className="p-10 md:p-16 rounded-3xl bg-[#FFFBF7] border border-[#CCBEB1] shadow-2xl relative overflow-hidden">
          <span className="text-xs font-mono text-[#664930] tracking-wider uppercase font-bold block mb-4">
            START DISCOVERING MATCHES TODAY
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#664930] tracking-tight max-w-2xl mx-auto leading-tight mb-6 font-sans">
            Stop searching thousands of irrelevant jobs.
          </h2>

          <p className="text-base md:text-lg text-[#997E67] max-w-xl mx-auto mb-10 leading-relaxed font-normal font-sans">
            Upload your resume once and let CareerAtlas continuously surface recommendations that fit your exact skills and experience.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#664930] hover:bg-[#523a26] text-white text-base font-semibold px-9 py-4 rounded-xl transition-all duration-200 shadow-md shadow-[#664930]/20 font-sans"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
