"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 50,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 0.98", "0.15 0.75"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  let initialX = 0;
  let initialY = 0;
  if (direction === "up") initialY = distance;
  if (direction === "down") initialY = -distance;
  if (direction === "left") initialX = distance;
  if (direction === "right") initialX = -distance;

  const y = useTransform(scrollYProgress, [0, 1], [initialY, 0]);
  const x = useTransform(scrollYProgress, [0, 1], [initialX, 0]);
  const filter = useTransform(scrollYProgress, [0, 1], ["blur(10px)", "blur(0px)"]);

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        x,
        y,
        filter,
      }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollTextReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["0 0.95", "0.55 0.35"],
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={`py-12 md:py-24 text-center max-w-5xl mx-auto px-6 ${className}`}>
      <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight flex flex-wrap justify-center gap-x-3 gap-y-2.5">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          // Progressive opacity, y-offset, and blur removal per word on scroll
          const wordOpacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
          const wordY = useTransform(scrollYProgress, [start, end], [16, 0]);
          const wordBlur = useTransform(scrollYProgress, [start, end], ["blur(14px)", "blur(0px)"]);

          const isBuiltForPrecision = word.toLowerCase().includes("built") || word.toLowerCase().includes("precision");

          return (
            <motion.span
              key={i}
              style={{
                opacity: wordOpacity,
                y: wordY,
                filter: wordBlur,
              }}
              className={`inline-block transition-colors ${
                isBuiltForPrecision
                  ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 font-black"
                  : "text-slate-100"
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </p>
    </div>
  );
}
