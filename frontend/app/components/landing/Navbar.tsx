"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { isAuthenticated } from "../../utils/auth";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-blue-400 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-[#2563EB]/25 group-hover:scale-105 transition-transform duration-200">
            CA
          </div>
          <span className="font-bold text-white tracking-tight text-lg group-hover:text-zinc-200 transition-colors">
            CareerAtlas
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors duration-200"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hover:text-white transition-colors duration-200"
          >
            FAQ
          </a>
          {isLoggedIn && (
            <Link
              href="/dashboard/resumes"
              className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>Resumes</span>
              <span className="text-[10px] bg-blue-950 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-800/40">VAULT</span>
            </Link>
          )}
        </nav>

        {/* CTA Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all duration-200 shadow-md shadow-[#2563EB]/20 hover:shadow-lg hover:shadow-[#2563EB]/40 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all duration-200 shadow-md shadow-[#2563EB]/20 hover:shadow-lg hover:shadow-[#2563EB]/40 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in / Sign up</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
