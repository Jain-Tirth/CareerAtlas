import React from "react";
import { LandingPageContainer } from "./components/landing/LandingPageContainer";

export const metadata = {
  title: "CareerAtlas - Discover Jobs That Fit Your Resume",
  description: "Upload your resume once. CareerAtlas analyzes your skills, projects, and experience to continuously recommend relevant jobs worth applying for.",
};

export default function LandingPage() {
  return <LandingPageContainer />;
}
