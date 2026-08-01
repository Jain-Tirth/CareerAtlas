"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, ShieldCheck, Target, LayoutDashboard, LogIn } from "lucide-react";
import { ProductMockup } from "./ProductMockup";
import { isAuthenticated } from "../../utils/auth";

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Words for animated headline
  const headlineWords = [
    { text: "The", highlight: false },
    { text: "fastest", highlight: false },
    { text: "way", highlight: false },
    { text: "to", highlight: false },
    { text: "discover", highlight: false },
    { text: "jobs", highlight: false },
    { text: "that", highlight: false },
    { text: "actually", highlight: true },
    { text: "fit", highlight: true },
    { text: "your", highlight: true },
    { text: "resume.", highlight: true },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const subVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: 0.5 },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-transparent text-center">
      {/* Ambient Animated Radial Glow Orb 1 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-[#2563EB]/30 via-blue-600/15 to-transparent blur-[130px] rounded-full pointer-events-none -z-10"
      />

      {/* Ambient Accent Orb 2 */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-[#10B981]/15 blur-[120px] rounded-full pointer-events-none -z-10"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Animated Word-by-Word Headline */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08] mb-6 flex flex-wrap justify-center gap-x-3.5 gap-y-1"
        >
          {headlineWords.map((word, idx) => (
            <motion.span
              key={idx}
              variants={wordVariants}
              className={
                word.highlight
                  ? "bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] via-blue-300 to-[#10B981] animate-text-shimmer font-black"
                  : "text-white"
              }
            >
              {word.text}
            </motion.span>
          ))}
        </motion.h1>

        {/* Animated Subheadline */}
        <motion.p
          variants={subVariants}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal mb-10"
        >
          Upload your resume once. CareerAtlas analyzes your skills, projects and experience to recommend jobs worth applying for—not thousands you'll never qualify for.
        </motion.p>

        {/* Action Buttons with Glowing Shadows */}
        <motion.div
          variants={subVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full sm:w-auto"
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="relative group/btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-blue-500 text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 btn-glow-blue overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-[#2563EB] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="relative group/btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-blue-500 text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 btn-glow-blue overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-[#2563EB] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </Link>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full sm:w-auto"
          >
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111827]/80 hover:bg-zinc-800 backdrop-blur-md text-zinc-300 hover:text-white border border-white/10 hover:border-[#2563EB]/50 card-glow-blue text-base font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current text-zinc-400" />
              <span>Watch Demo</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Honest Assurance Badges */}
        <motion.div
          variants={subVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 mb-16 font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Zero recruiter spam</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2563EB]" />
            <span>Deterministic fit scoring</span>
          </div>
        </motion.div>

        {/* Product Screenshot / Interactive UI Preview */}
        <div className="relative">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
