'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Play, Sparkles } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

export interface NavLink {
  label: string;
  href: string;
}

export interface TrustedBrand {
  name: string;
  mark: 'google' | 'adobe' | 'microsoft' | 'stripe';
}

export interface Hero15Props {
  brandName?: string;
  navLinks?: NavLink[];
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  signupLabel?: string;
  signupHref?: string;
  trustedEyebrow?: string;
  trustedBrands?: TrustedBrand[];
  backgroundImage?: string;
  children?: React.ReactNode;
}

const navLinksDefault: NavLink[] = [
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

const trustedBrandsDefault: TrustedBrand[] = [
  { name: 'Google', mark: 'google' },
  { name: 'Adobe', mark: 'adobe' },
  { name: 'Microsoft', mark: 'microsoft' },
  { name: 'stripe', mark: 'stripe' },
];

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const softReveal: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1.2, stiffness: 40, damping: 15 },
  },
};

const navReveal: Variants = {
  hidden: { opacity: 0, y: -12, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1, stiffness: 50, damping: 12 },
  },
};

const brandReveal: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.94, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 0.8, stiffness: 60, damping: 12 },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1.5, stiffness: 30, damping: 20 },
  },
};

function LogoIcon({ className = "size-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 p-1.5 shadow-lg shadow-blue-500/20 ${className}`}>
      <ShieldCheck className="size-5" />
    </div>
  );
}

function TrustedMark({ mark }: { mark: TrustedBrand['mark'] }) {
  if (mark === 'google') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path fill="currentColor" d="M21.5 12.3c0-.8-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 2.9-4.2 2.9-7.3Z" />
        <path fill="currentColor" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9a6 6 0 0 1-5.7-4.1H3v2.6A10 10 0 0 0 12 22Z" />
        <path fill="currentColor" d="M6.3 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.3-2.6Z" />
        <path fill="currentColor" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-9 5.5l3.3 2.6A6 6 0 0 1 12 6Z" />
      </svg>
    );
  }

  if (mark === 'adobe') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path fill="currentColor" d="M14.3 3h6.3v18L14.3 3Zm-4.6 0H3.4v18L9.7 3Zm2.3 7.1 4.1 10.9h-2.7l-1.2-3.2H9.6l2.4-7.7Z" />
      </svg>
    );
  }

  if (mark === 'microsoft') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path fill="currentColor" d="M3 3h8.5v8.5H3V3Zm9.5 0H21v8.5h-8.5V3ZM3 12.5h8.5V21H3v-8.5Zm9.5 0H21V21h-8.5v-8.5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="currentColor" d="M13.1 10.1c-1.6-.6-2.5-1-2.5-1.7 0-.6.5-.9 1.5-.9 1.7 0 3.4.6 4.5 1.2V4.5a11.9 11.9 0 0 0-4.5-.8C8.5 3.7 6 5.6 6 8.7c0 4.9 6.7 4.1 6.7 6.2 0 .8-.7 1.1-1.7 1.1-1.5 0-3.5-.6-5.1-1.5v4.3c1.7.7 3.4 1 5.1 1 3.7 0 6.2-1.8 6.2-5 0-5.3-6.7-4.4-6.7-6.4 0-.7.6-1 1.6-1Z" />
    </svg>
  );
}

export function Hero15({
  brandName = 'CareerAtlas AI',
  headingLine1 = 'Where Resume Fits',
  headingLine2 = 'High-Impact Opportunities',
  primaryCtaLabel = 'Get Started Free',
  primaryCtaHref = '/login',
  signupHref = '/login',
  trustedEyebrow = 'Trusted By High-Impact Tech Candidates',
  trustedBrands = trustedBrandsDefault,
  backgroundImage = '/career_login_hero.jpg',
  children,
}: Hero15Props) {
  return (
    <section className="relative isolate flex min-h-screen w-full overflow-hidden bg-neutral-950 px-1.5 py-1.5 text-white antialiased">
      <motion.div
        className="relative flex min-h-screen w-full flex-col overflow-hidden bg-neutral-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] md:min-h-screen rounded-2xl border border-slate-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionVariants}
      >
        {/* Background Image with Ambient Overlay */}
        <motion.img
          variants={imageVariants}
          src={backgroundImage}
          alt="CareerAtlas Hero Visual"
          className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-[2px]"
        />

        {/* Ambient Dark Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-slate-950/80 to-blue-950/40 pointer-events-none" />

        {/* Navigation Bar */}


        {/* Hero Main Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-6 pt-16 pb-12 text-center sm:px-12 sm:pt-20 lg:px-24">
          <motion.div
            variants={softReveal}
            className="mx-auto max-w-4xl 2xl:max-w-7xl"
          >
            <h1 className="text-[clamp(2.5rem,5.8vw,5.5rem)] leading-[1.02] font-extrabold tracking-tight text-balance text-white">
              <span className="block">{headingLine1}</span>
              <span className="mt-2 block font-serif text-[1.06em] leading-[0.94] font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                {headingLine2}
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={softReveal}
            className="mt-6 max-w-2xl font-sans text-base leading-relaxed font-normal text-slate-300 sm:text-lg 2xl:text-xl"
          >
          </motion.p>

          <motion.div
            variants={softReveal}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href={primaryCtaHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-xl shadow-blue-600/30 transition-all duration-200 hover:bg-blue-500 active:scale-[0.96]"
            >
              {primaryCtaLabel}
            </a>
            {/* <a
              href={secondaryCtaHref}
              className="group/secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900/80 px-6 text-base font-medium text-slate-200 border border-slate-800 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 active:scale-[0.96]"
            >
              {secondaryCtaLabel}
              <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover/secondary:translate-x-1" />
            </a> */}
          </motion.div>

          {/* Optional Children (e.g. Product Mockup) */}
          {children && (
            <motion.div variants={softReveal} className="w-full mt-12">
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default Hero15;
