"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface TextLoopProps {
  items: string[];
  intervalMs?: number;
  className?: string;
}

const variants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function TextLoop({
  items,
  intervalMs = 2400,
  className = "",
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    // Always track latest item
    setCurrentIndex(items.length - 1);
  }, [items]);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [items, intervalMs]);

  if (!items || items.length === 0) return null;

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="inline-block truncate"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
