"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DoubleStairPreloader({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<"TEXT_INTRO" | "STAIR_ANIMATION" | "COMPLETE">("TEXT_INTRO");

  const words = ["Ready", "for", "job", "matching"];

  useEffect(() => {
    // Word-by-word sequence: 0.25s per word fade-in + hold + 0.3s fade-out => ~1.4s total
    const textTimer = setTimeout(() => {
      setPhase("STAIR_ANIMATION");
    }, 1500);

    // Horizontal stair slide reveal => 2.3s total
    const completionTimer = setTimeout(() => {
      setPhase("COMPLETE");
      onComplete?.();
    }, 2300);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  const stairCount = 5;

  // Horizontal Left Panel Stair Variants (Sliding Left x: -100%)
  const leftStairVariants = (index: number) => ({
    initial: { x: "0%" },
    exit: {
      x: "-100%",
      transition: {
        duration: 0.75,
        ease: [0.76, 0, 0.24, 1] as const,
        delay: index * 0.05,
      },
    },
  });

  // Horizontal Right Panel Stair Variants (Sliding Right x: 100%)
  const rightStairVariants = (index: number) => ({
    initial: { x: "0%" },
    exit: {
      x: "100%",
      transition: {
        duration: 0.75,
        ease: [0.76, 0, 0.24, 1] as const,
        delay: index * 0.05,
      },
    },
  });

  // Container variants for staggered word-by-word fade in & out
  const wordContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1,
        duration: 0.35,
        ease: [0.42, 0, 0.58, 1] as const,
      },
    },
  };

  const wordChildVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: "blur(4px)",
      transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as const },
    },
  };

  if (phase === "COMPLETE") return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="horizontal-double-stair-preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        className="fixed inset-0 z-50 pointer-events-none flex flex-row overflow-hidden font-sans"
      >
        {/* Left Horizontal Stair Set (Sliding Left) */}
        <div className="relative w-1/2 h-full flex flex-col">
          {Array.from({ length: stairCount }).map((_, i) => (
            <motion.div
              key={`left-stair-${i}`}
              custom={i}
              initial="initial"
              animate={phase === "STAIR_ANIMATION" ? "exit" : "initial"}
              variants={leftStairVariants(i)}
              className="w-full flex-1 bg-[#FFFBF7] border-b border-[#CCBEB1]/60 relative shadow-sm"
            >
              <div className="absolute right-0 inset-y-0 w-1 bg-[#664930] opacity-30" />
            </motion.div>
          ))}
        </div>

        {/* Center Text Intro: Word-by-Word Fade-In / Fade-Out */}
        <AnimatePresence>
          {phase === "TEXT_INTRO" && (
            <motion.div
              key="intro-words-wrapper"
              variants={wordContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none px-6"
            >
              <div className="p-6 sm:p-8 rounded-2xl bg-white/90 border border-[#CCBEB1] shadow-2xl text-center backdrop-blur-md flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2">
                {words.map((word, idx) => (
                  <motion.span
                    key={`word-${idx}`}
                    variants={wordChildVariants}
                    className="text-2xl sm:text-4xl font-extrabold text-[#664930] tracking-tight font-sans inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Horizontal Stair Set (Sliding Right) */}
        <div className="relative w-1/2 h-full flex flex-col">
          {Array.from({ length: stairCount }).map((_, i) => (
            <motion.div
              key={`right-stair-${i}`}
              custom={i}
              initial="initial"
              animate={phase === "STAIR_ANIMATION" ? "exit" : "initial"}
              variants={rightStairVariants(i)}
              className="w-full flex-1 bg-[#FFFBF7] border-b border-[#CCBEB1]/60 relative shadow-sm"
            >
              <div className="absolute left-0 inset-y-0 w-1 bg-[#997E67] opacity-30" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * In-View Smooth Horizontal Stair Progress Bar on Scroll
 */
export function HorizontalScrollStairs() {
  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-6">
      <div className="flex items-center gap-2 mb-2 justify-between text-xs font-mono text-[#997E67]">
        <span className="font-bold text-[#664930]">SYSTEMATIC MATCH PROGRESSION</span>
        <span>STAGE 01 — STAGE 05</span>
      </div>
      <div className="grid grid-cols-5 gap-2 h-2.5 w-full">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="h-full bg-[#664930] rounded-full origin-left shadow-sm"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="h-full bg-[#664930]/80 rounded-full origin-left shadow-sm"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="h-full bg-[#997E67] rounded-full origin-left shadow-sm"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="h-full bg-[#CCBEB1] rounded-full origin-left shadow-sm"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="h-full bg-[#FFDBBB] rounded-full origin-left shadow-sm"
        />
      </div>
    </div>
  );
}
