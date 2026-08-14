"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const faqs = [
    {
      question: "Is my resume private?",
      answer: "Yes. Your resume data and parsed profile embeddings are stored isolated and processed strictly for candidate-job matching. We never sell, share, or monetize your resume data with third-party recruiters or advertisers.",
    },
    {
      question: "How accurate are recommendations?",
      answer: "Recommendations combine hard constraint rules (location, remote preferences, employment type) with 384-dimension vector embeddings. Rather than keyword matching, it evaluates semantic skill overlap, experience tenure, and project tech stack.",
    },
    {
      question: "Can I upload multiple resumes?",
      answer: "Yes. You can manage multiple resume versions tailored for different roles (such as Frontend Engineer vs. Full-Stack Architect) and test match scores across versions.",
    },
    {
      question: "Can I delete my data?",
      answer: "Yes. You can purge your uploaded resume, parsed profile taxonomy, vector embeddings, and match history with a single click at any time.",
    },
    {
      question: "Do you support students and new grads?",
      answer: "Yes. CareerAtlas parses academic projects, hackathons, open-source work, and core technical skills to match entry-level and internship roles effectively without requiring years of corporate tenure.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 bg-transparent scroll-mt-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#664930] tracking-tight mt-3 mb-4 font-sans">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#664930] shadow-xl"
                    : "bg-[#FFFBF7] border-[#CCBEB1] hover:border-[#997E67]"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-[#664930] text-base md:text-lg focus:outline-none font-sans"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#664930] text-white" : "bg-[#FFDBBB] text-[#664930]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#997E67] leading-relaxed border-t border-[#CCBEB1]/50 pt-4 font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
