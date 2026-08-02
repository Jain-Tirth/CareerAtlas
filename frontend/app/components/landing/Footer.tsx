"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-white/10 text-zinc-400 py-16 text-sm relative z-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Status */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-blue-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#2563EB]/20">
              CA
            </div>
            <span className="font-bold text-white tracking-tight text-base">CareerAtlas</span>
          </Link>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Autonomous job discovery and resume matching engine for software engineers.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Product
          </span>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Matching Engine
              </a>
            </li>
  
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Launch App
              </Link>
            </li>
          </ul>
        </div>
        {/* Legal & Trust */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Privacy & Data
          </span>
          <ul className="space-y-2 text-xs">
            <li className="text-zinc-500">Private & isolated processing</li>
            <li className="text-zinc-500">Zero third-party data sales</li>
            <li className="text-zinc-500">One-click data deletion</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div>© {new Date().getFullYear()} CareerAtlas Inc. All rights reserved.</div>
        <div className="font-mono text-[11px]">Designed for easy and matching job findings</div>
      </div>
    </footer>
  );
}
