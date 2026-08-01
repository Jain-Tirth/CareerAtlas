"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingLoopProps {
  messages?: string[];
  intervalMs?: number;
  className?: string;
}

const DEFAULT_MESSAGES = [
  "Thinking...",
  "Analyzing resume structure...",
  "Generating 384-dimensional vector embeddings...",
  "Searching Greenhouse API...",
  "Searching Lever boards...",
  "Searching Ashby & LinkedIn...",
  "Evaluating ATS keyword density...",
  "Ranking candidate opportunities...",
];

export default function TypingLoop({
  messages = DEFAULT_MESSAGES,
  intervalMs = 2800,
  className = "",
}: TypingLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  return (
    <div className={`flex items-center gap-2 font-mono ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-blue-400/90 font-medium tracking-wide"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
