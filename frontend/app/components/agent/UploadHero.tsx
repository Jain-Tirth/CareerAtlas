"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface UploadHeroProps {
  onFileUpload: (file: File) => void;
  isParsing: boolean;
  activeResumeName?: string;
}

export default function UploadHero({
  onFileUpload,
  isParsing,
  activeResumeName,
}: UploadHeroProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileUpload(file);
      } else {
        alert("Please upload a PDF resume file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {activeResumeName && !isParsing ? (
          <motion.div
            key="compact-summary"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white truncate max-w-xs sm:max-w-md">
                    {activeResumeName}
                  </span>
                  <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Active Version
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Parsed & indexed into vector database. Ready for agent discovery.
                </span>
              </div>
            </div>

            <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10 shrink-0 text-center active:scale-95">
              Upload New PDF
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isParsing}
              />
            </label>
          </motion.div>
        ) : (
          <motion.label
            key="hero-dropzone"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              isDragging
                ? "border-blue-500 bg-blue-950/30 shadow-2xl shadow-blue-500/20 scale-[1.01]"
                : "border-white/15 hover:border-blue-500/50 bg-[#111827]/40 hover:bg-[#111827]/80"
            }`}
          >
            {/* Ambient Background Light Beam */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              {isParsing ? (
                <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
              ) : (
                <UploadCloud className="w-7 h-7 text-blue-400" />
              )}
            </div>

            <h3 className="text-base font-extrabold text-white tracking-tight text-center">
              {isParsing ? "Extracting & Parsing Resume..." : "Drop PDF Resume Here to Initialize Agent"}
            </h3>

            <p className="text-xs text-zinc-400 text-center max-w-md mt-1 font-mono">
              {isParsing
                ? "Autonomous LLM parsing skills, experience, & target roles..."
                : "Drag & drop your resume PDF once. CareerAtlas will store versions & auto-recommend matching roles."}
            </p>

            <span className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              <Sparkles className="w-3.5 h-3.5" />
              Browse PDF File
            </span>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isParsing}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
