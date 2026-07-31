"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";

interface VelocityScrollTickerProps {
  text: string;
  defaultVelocity?: number;
  className?: string;
}

export function VelocityScrollTicker({
  text,
  defaultVelocity = 2,
  className = "",
}: VelocityScrollTickerProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * defaultVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    let newX = baseX.get() + moveBy;
    if (newX <= -50) {
      newX = 0;
    } else if (newX >= 0) {
      newX = -50;
    }
    baseX.set(newX);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap py-4 border-y border-blue-500/10 bg-slate-950/80 backdrop-blur-xl relative z-10">
      <motion.div className={`flex flex-nowrap font-mono uppercase tracking-widest text-xs font-bold text-slate-400 gap-8 ${className}`} style={{ x }}>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </motion.div>
    </div>
  );
}
