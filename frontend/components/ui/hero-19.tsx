'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, Cpu, Target } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import Link from 'next/link';
import { isAuthenticated } from '@/app/utils/auth';

interface NavLink {
  label: string;
  href: string;
  hasMenu?: boolean;
}

interface Hero19Props {
  brandName?: string;
  navLinks?: NavLink[];
  eyebrow?: string;
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  bookingLabel?: string;
  bookingHref?: string;
  scrollLabel?: string;
}

const navLinksDefault: NavLink[] = [
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.14,
    },
  },
};

const navVariants: Variants = {
  hidden: { opacity: 0, y: -12, filter: 'blur(7px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.62, bounce: 0 },
  },
};

const copyVariants: Variants = {
  hidden: { opacity: 0, x: -22, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.78, bounce: 0 },
  },
};

const buildingVariants: Variants = {
  hidden: { opacity: 0, x: 30, y: 18, scale: 1.04, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 1.08, bounce: 0 },
  },
};

const buttonRowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.58, bounce: 0 },
  },
};

import { CareerAtlasLogoMark } from '@/components/ui/CareerAtlasLogoMark';

export default function Hero19({
  brandName = 'CareerAtlas AI',
  navLinks = navLinksDefault,
  eyebrow = "DETERMINISTIC CAREER INTELLIGENCE ENGINE",
  headingLine1 = 'Where Resume Fits',
  headingLine2 = 'High-Impact Opportunities',
  description = 'Upload your resume once. CareerAtlas converts your skills into 384-dimension vector embeddings to recommend jobs worth applying for—not thousands you will never qualify for.',
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel = 'Explore Pipeline',
  secondaryCtaHref = '#pipeline',
  bookingLabel,
  bookingHref,
  scrollLabel = 'Scroll to Explore',
}: Hero19Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const dynamicPrimaryLabel = primaryCtaLabel || (isLoggedIn ? "Go to Dashboard" : "Get Started Free");
  const dynamicPrimaryHref = primaryCtaHref || (isLoggedIn ? "/dashboard" : "/login");
  const dynamicBookingLabel = bookingLabel || (isLoggedIn ? "Dashboard" : "Sign in");
  const dynamicBookingHref = bookingHref || (isLoggedIn ? "/dashboard" : "/login");

  return (
    <section className="relative isolate min-h-screen overflow-hidden font-sans text-[#664930] bg-[#FFFBF7] antialiased pt-24 pb-8">
      <motion.div
        className="relative flex min-h-[calc(100vh-6rem)] w-full flex-col overflow-hidden px-6 py-8 sm:px-10 lg:px-16 bg-white border border-[#CCBEB1] rounded-3xl shadow-xl shadow-slate-900/5 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.36 }}
        variants={sectionVariants}
      >
        {/* Clean Bright Interactive Backdrop Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFDBBB]/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#CCBEB1]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Main Split Content Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 items-center py-8">
          {/* Left Column: Kinetic Copy */}
          <div className="lg:col-span-7 max-w-[39rem]">
            <motion.div variants={copyVariants} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFDBBB] border border-[#CCBEB1] text-xs font-mono text-[#664930] mb-5 shadow-2xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#664930]" />
              <span>{eyebrow}</span>
            </motion.div>

            <motion.h1
              variants={copyVariants}
              className="mt-2 max-w-[38rem] text-[clamp(2.5rem,4.8vw,4.2rem)] leading-[1.04] font-extrabold tracking-tight text-balance text-[#664930]"
            >
              <span className="block">{headingLine1}</span>
              <span className="mt-1 block font-sans italic text-[#997E67]">
                {headingLine2}
              </span>
            </motion.h1>

            <motion.p
              variants={copyVariants}
              className="mt-5 max-w-[32rem] text-base sm:text-lg leading-relaxed font-normal text-[#997E67] font-sans"
            >
              {description}
            </motion.p>

            <motion.div
              variants={buttonRowVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <motion.a
                variants={buttonVariants}
                href={dynamicPrimaryHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#664930] px-7 text-base font-semibold text-white shadow-lg shadow-[#664930]/25 transition-all hover:bg-[#523a26] active:scale-[0.96]"
              >
                {dynamicPrimaryLabel}
                <ArrowRight className="size-4" />
              </motion.a>
              <motion.a
                variants={buttonVariants}
                href={secondaryCtaHref}
                className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-white border border-[#CCBEB1] px-6 text-base font-semibold text-[#664930] shadow-xs transition-all hover:bg-[#FFFBF7] active:scale-[0.96]"
              >
                {secondaryCtaLabel}
              </motion.a>
            </motion.div>
          </div>

          {/* Right Column: Live Vector Matching Card */}
          <motion.div
            variants={buildingVariants}
            className="lg:col-span-5 p-6 bg-[#FFFBF7] border border-[#CCBEB1] rounded-2xl shadow-md space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#CCBEB1]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#664930]" />
                <span className="text-xs font-mono font-semibold text-[#664930] uppercase">Vector Matching Engine</span>
              </div>
              <span className="text-[10px] font-mono bg-[#FFDBBB] text-[#664930] border border-[#CCBEB1] font-bold px-2 py-0.5 rounded-md">99.4% FIT</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white border border-[#CCBEB1] rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#664930]">Senior AI Systems Lead</span>
                  <span className="font-mono text-[#997E67] font-bold">98.6% Match</span>
                </div>
                <p className="text-[11px] text-[#997E67] font-sans">Stripe • Remote • $210k - $260k</p>
              </div>

              <div className="p-3 bg-white border border-[#CCBEB1] rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#664930]">Staff Infrastructure Engineer</span>
                  <span className="font-mono text-[#997E67] font-bold">96.2% Match</span>
                </div>
                <p className="text-[11px] text-[#997E67] font-sans">Vercel • San Francisco • $190k - $240k</p>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-[#997E67] font-sans">
              Powered by Qdrant 384d Embeddings & Camoufox Anti-Detect Scraping
            </div>
          </motion.div>
        </div>

        <motion.a
          variants={copyVariants}
          href="#pipeline"
          className="absolute right-7 bottom-6 z-20 hidden min-h-10 items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-600 md:inline-flex lg:right-12 lg:bottom-8"
        >
          {scrollLabel}
          <ArrowDown className="size-3.5" />
        </motion.a>
      </motion.div>
    </section>
  );
}
