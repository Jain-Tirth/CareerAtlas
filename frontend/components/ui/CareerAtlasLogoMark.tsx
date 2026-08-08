"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function CareerAtlasLogoMark({ className = "h-9 w-auto", size = 36, showText = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Precision Geometric 'CA' Monogram + Target Vector Radar Mark (Panel 1 from Brandkit) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        {/* Monogram 'C' Loop in Deep Earth Bronze (#664930) */}
        <path
          d="M 42 22 C 24 22, 12 36, 12 50 C 12 64, 24 78, 42 78 C 54 78, 62 70, 65 62 L 53 62 C 51 67, 47 70, 42 70 C 31 70, 22 61, 22 50 C 22 39, 31 30, 42 30 C 47 30, 51 33, 53 38 L 65 38 C 62 30, 54 22, 42 22 Z"
          fill="#664930"
        />

        {/* Monogram 'A' Incline in Deep Earth Bronze (#664930) */}
        <path
          d="M 52 78 L 64 78 L 70 62 L 80 62 L 80 54 L 67 54 L 61 38 L 69 18 L 57 18 L 47 43 L 53 50 L 58 38 L 65 54 L 59 70 Z"
          fill="#664930"
        />

        {/* Target Vector Radar Crosshairs & Outer Rings in Warm Amber Taupe (#997E67) */}
        <circle cx="70" cy="50" r="26" stroke="#997E67" strokeWidth="3.5" fill="none" opacity="0.9" />
        <circle cx="70" cy="50" r="17" stroke="#997E67" strokeWidth="2.5" strokeDasharray="3 3" fill="none" opacity="0.8" />
        <circle cx="70" cy="50" r="8" fill="#664930" />
        <circle cx="70" cy="50" r="3" fill="#FFDBBB" />

        {/* Radar Crosshair Axes */}
        <line x1="70" y1="18" x2="70" y2="82" stroke="#997E67" strokeWidth="2.5" opacity="0.85" />
        <line x1="38" y1="50" x2="102" y2="50" stroke="#997E67" strokeWidth="2.5" opacity="0.85" />

        {/* Target Corner Align Marks */}
        <path d="M 48 30 L 48 20 L 58 20" stroke="#664930" strokeWidth="2" fill="none" />
        <path d="M 92 30 L 92 20 L 82 20" stroke="#997E67" strokeWidth="2" fill="none" />
        <path d="M 48 70 L 48 80 L 58 80" stroke="#664930" strokeWidth="2" fill="none" />
        <path d="M 92 70 L 92 80 L 82 80" stroke="#997E67" strokeWidth="2" fill="none" />
      </svg>

      {showText && (
        <span className="font-extrabold text-[#664930] tracking-tight text-lg flex items-center gap-1.5 font-sans">
          <span>CareerAtlas</span>
          <span className="text-[#997E67] font-black">AI</span>
        </span>
      )}
    </div>
  );
}
