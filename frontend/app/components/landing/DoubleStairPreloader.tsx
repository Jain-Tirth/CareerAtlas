"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

export function DoubleStairPreloader({ onComplete }: { onComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete?.();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Staircase step variants
  const stairCount = 5;

  const containerVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const stairUpVariants = (index: number) => ({
    initial: { y: "0%" },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1] as const,
        delay: index * 0.06,
      },
    },
  });

  const stairDownVariants = (index: number) => ({
    initial: { y: "0%" },
    exit: {
      y: "100%",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1] as const,
        delay: index * 0.06,
      },
    },
  });

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="double-stair-preloader"
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden"
        >
          {/* Top Stair Set (Sliding Up in Staggered Steps) */}
          <div className="relative w-full h-1/2 flex">
            {Array.from({ length: stairCount }).map((_, i) => (
              <motion.div
                key={`top-stair-${i}`}
                custom={i}
                variants={stairUpVariants(i)}
                className="h-full flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-blue-500/10 shadow-2xl relative"
              >
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-40" />
              </motion.div>
            ))}
          </div>

          {/* Center Brand Logo & Status Pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 shadow-2xl shadow-blue-500/30 backdrop-blur-xl">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              CareerAtlas
              <span className="text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">v2.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
              Initializing AI Career Intelligence Engine...
            </p>
          </motion.div>

          {/* Bottom Stair Set (Sliding Down in Staggered Steps) */}
          <div className="relative w-full h-1/2 flex">
            {Array.from({ length: stairCount }).map((_, i) => (
              <motion.div
                key={`bottom-stair-${i}`}
                custom={stairCount - 1 - i}
                variants={stairDownVariants(stairCount - 1 - i)}
                className="h-full flex-1 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 border-r border-blue-500/10 shadow-2xl relative"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-600 opacity-40" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
