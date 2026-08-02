"use client";

import React, { useState, useEffect } from "react";
import { Hero15 } from "@/components/ui/hero-15";
import { ProductMockup } from "./ProductMockup";
import { isAuthenticated } from "../../utils/auth";

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <div className="pt-20">
      <Hero15
        brandName="CareerAtlas AI"
        headingLine1="Where Resume Fits"
        headingLine2="High-Impact Opportunities"
        description="Upload your resume once. CareerAtlas converts your skills into 384-dimension vector embeddings to recommend jobs worth applying for—not thousands you'll never qualify for."
        primaryCtaLabel={isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
        primaryCtaHref={isLoggedIn ? "/dashboard" : "/login"}
        secondaryCtaLabel="Explore Pipeline"
        secondaryCtaHref="#pipeline"
        signupLabel={isLoggedIn ? "Dashboard" : "Sign in"}
        signupHref={isLoggedIn ? "/dashboard" : "/login"}
        trustedEyebrow="Trusted By High-Impact Tech Candidates"
      >
        <div className="relative mt-8 max-w-6xl mx-auto">
          <ProductMockup />
        </div>
      </Hero15>
    </div>
  );
}
