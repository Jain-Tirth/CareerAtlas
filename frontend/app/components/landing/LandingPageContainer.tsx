"use client";

import React, { useRef } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { PipelineSection } from "./PipelineSection";
import { FeaturesSection } from "./FeaturesSection";
import { FaqSection } from "./FaqSection";
import { Footer } from "./Footer";
import { DoubleStairPreloader} from "./DoubleStairPreloader";
import { ScrollReveal, ScrollTextReveal } from "./ScrollReveal";

export function LandingPageContainer() {
  const pageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    pageRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
    pageRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
  };

  return (
    <>
      {/* Horizontal Double Staircase Preloader */}
      <DoubleStairPreloader />

      <div
        ref={pageRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen bg-[#FFFBF7] text-[#664930] font-sans selection:bg-[#664930] selection:text-white antialiased overflow-x-hidden group"
      >
        {/* Page-Wide Grid Background */}
        <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

        {/* Main Page Content */}
        <div className="relative z-10">
          <Navbar />
          <main>
            <HeroSection />

            {/* Scroll-Driven Progressive Word Reveal */}
            <ScrollTextReveal text="Built for candidates who demand high-precision resume matching and deterministic career progression." />

            <ScrollReveal direction="up">
              <PipelineSection />
            </ScrollReveal>

            <ScrollReveal direction="up">
              <FeaturesSection />
            </ScrollReveal>

            <ScrollReveal direction="up">
              <FaqSection />
            </ScrollReveal>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
