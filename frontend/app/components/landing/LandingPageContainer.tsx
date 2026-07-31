"use client";

import React, { useRef } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { PipelineSection } from "./PipelineSection";
import { FeaturesSection } from "./FeaturesSection";
import { RoadmapSection } from "./RoadmapSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";
import { DoubleStairPreloader } from "./DoubleStairPreloader";
import { VelocityScrollTicker } from "./VelocityScrollTicker";

export function LandingPageContainer() {
  const pageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    pageRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
    pageRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
  };

  return (
    <>
      {/* Double Staircase Preloader */}
      <DoubleStairPreloader />

      <div
        ref={pageRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-[#2563EB] selection:text-white antialiased overflow-x-hidden group"
      >
        {/* Page-Wide Grid Background */}
        <div className="fixed inset-0 bg-grid-pattern opacity-70 pointer-events-none z-0" />

        {/* Page-Wide Zero-Lag Native CSS Mouse Spotlight Beam */}
        <div
          className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(700px circle at var(--mouse-x, 50vw) var(--mouse-y, 30vh), rgba(37, 99, 235, 0.22), transparent 75%)`,
          }}
        />

        {/* Main Page Content */}
        <div className="relative z-10">
          <Navbar />
          <main>
            <HeroSection />
            
            {/* Skiper UI Smooth Velocity Ticker Banner */}
            <VelocityScrollTicker
              text="AI VECTOR MATCHING • REAL-TIME SCRAPING • ZERO RECRUITER SPAM • 99.4% PRECISION MATCHING • AUTONOMOUS CAREER OS • "
              defaultVelocity={1.5}
              className="text-blue-400/90"
            />

            <PipelineSection />
            
            <VelocityScrollTicker
              text="QDRANT EMBEDDINGS • CAMOUFOX ANTI-DETECT BROWSER • FAST SWC COMPILER • DETERMINISTIC MATCH SCORING • "
              defaultVelocity={-1.5}
              className="text-emerald-400/90"
            />

            <FeaturesSection />
            <RoadmapSection />
            <FaqSection />
            <CtaSection />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
