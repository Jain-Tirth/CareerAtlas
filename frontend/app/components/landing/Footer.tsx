"use client";

import React from "react";
import Link from "next/link";

import { CareerAtlasLogoMark } from "@/components/ui/CareerAtlasLogoMark";

export function Footer() {
  return (
    <footer className="bg-[#FFFBF7] border-t border-[#CCBEB1] text-[#997E67] py-16 text-sm relative z-10 font-sans">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Status */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <CareerAtlasLogoMark size={32} showText />
          </Link>

          <p className="text-xs text-[#997E67] leading-relaxed">
            Autonomous job discovery and resume matching engine for software engineers.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-[#664930] uppercase tracking-wider block">
            Product
          </span>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#how-it-works" className="hover:text-[#664930] transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-[#664930] transition-colors">
                Matching Engine
              </a>
            </li>
  
            <li>
              <Link href="/dashboard" className="hover:text-[#664930] transition-colors">
                Launch App
              </Link>
            </li>
          </ul>
        </div>
        {/* Legal & Trust */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-[#664930] uppercase tracking-wider block">
            Privacy & Data
          </span>
          <ul className="space-y-2 text-xs">
            <li className="text-[#997E67]">Private & isolated processing</li>
            <li className="text-[#997E67]">Zero third-party data sales</li>
            <li className="text-[#997E67]">One-click data deletion</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-[#CCBEB1]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#997E67]">
        <div>© {new Date().getFullYear()} CareerAtlas Inc. All rights reserved.</div>
        <div className="font-mono text-[11px]">Designed for high-precision resume matching</div>
      </div>
    </footer>
  );
}
