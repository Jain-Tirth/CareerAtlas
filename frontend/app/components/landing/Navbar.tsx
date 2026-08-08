"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { isAuthenticated } from "../../utils/auth";

import { CareerAtlasLogoMark } from "@/components/ui/CareerAtlasLogoMark";

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
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-md shadow-slate-900/5"
          : "bg-white/70 backdrop-blur-xs py-4 border-b border-slate-200/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <CareerAtlasLogoMark size={36} showText />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#997E67]">
          <a
            href="#how-it-works"
            className="hover:text-[#664930] transition-colors duration-200"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-[#664930] transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hover:text-[#664930] transition-colors duration-200"
          >
            FAQ
          </a>
          {isLoggedIn && (
            <Link
              href="/dashboard/resumes"
              className="hover:text-[#664930] transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>Resumes</span>
              <span className="text-[10px] bg-[#FFDBBB] text-[#664930] font-mono px-1.5 py-0.5 rounded border border-[#CCBEB1] font-bold">VAULT</span>
            </Link>
          )}
        </nav>

        {/* CTA Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#664930] hover:bg-[#523a26] text-white text-sm font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#664930]/20 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#664930] hover:bg-[#523a26] text-white text-sm font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#664930]/20 active:scale-95"
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
