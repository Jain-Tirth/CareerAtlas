"use client";

import React from "react";
import { User, MapPin, Briefcase, GraduationCap, Sparkles, SlidersHorizontal, Search } from "lucide-react";
import { Skiper106Input } from "@/components/ui/skiper-ui/skiper106";

export interface ParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  coreSkills: string[];
  experienceLevel: string;
  experienceYears?: number | string;
  education?: string[];
  targetLocation: string;
  isRemoteOpen: boolean;
}

interface RightInspectorProps {
  profile: ParsedProfile | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  locationPref: string;
  setLocationPref: (val: string) => void;
  isRemoteOpen: boolean;
  setIsRemoteOpen: (val: boolean) => void;
  employmentTypes: string[];
  setEmploymentTypes: (types: string[]) => void;
  suggestions: string[];
  onSelectSuggestion: (title: string) => void;
}

export default function RightInspectorPanel({
  profile,
  searchTerm,
  setSearchTerm,
  locationPref,
  setLocationPref,
  isRemoteOpen,
  setIsRemoteOpen,
  employmentTypes,
  setEmploymentTypes,
  suggestions,
  onSelectSuggestion,
}: RightInspectorProps) {
  return (
    <aside className="w-full lg:w-80 bg-[#FFFBF7] border-l border-[#CCBEB1] p-5 flex flex-col shrink-0 h-full min-h-[calc(100vh-4rem)] space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#CCBEB1]/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#664930]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#664930]">
            Agent Inspector & Parameters
          </h3>
        </div>
      </div>

      {/* Target Search Term */}
      <div className="space-y-2">
        <Skiper106Input
          label="Typed Preferred Role"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="e.g. Frontend Engineer, Full Stack"
          icon={<Search className="w-4 h-4 text-[#997E67]" />}
          className="font-mono text-xs"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-mono uppercase text-[#997E67] block">AI Recommended Titles</span>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => onSelectSuggestion(sugg)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    searchTerm === sugg
                      ? "bg-[#664930] border-[#523a26] text-white font-bold"
                      : "bg-white border-[#CCBEB1] text-[#664930] hover:bg-[#FFDBBB]"
                  }`}
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Target Location & Remote */}
      <div className="space-y-3">
        <Skiper106Input
          label="Target Search Location"
          type="text"
          value={locationPref}
          onChange={(e) => setLocationPref(e.target.value)}
          placeholder="e.g. Ahmedabad, Remote"
          icon={<MapPin className="w-4 h-4 text-[#997E67]" />}
          className="font-mono text-xs"
        />

        <div className="flex items-center justify-between bg-white border border-[#CCBEB1] rounded-xl p-3">
          <span className="text-xs text-[#664930] font-bold">Include Remote Jobs</span>
          <button
            onClick={() => setIsRemoteOpen(!isRemoteOpen)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isRemoteOpen ? "bg-[#664930]" : "bg-[#CCBEB1]"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isRemoteOpen ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold uppercase text-[#664930]">
          Employment Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["Full-time", "Part-time", "Contract", "Internship"].map((type) => {
            const isSelected = employmentTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    if (employmentTypes.length > 1) {
                      setEmploymentTypes(employmentTypes.filter((t) => t !== type));
                    }
                  } else {
                    setEmploymentTypes([...employmentTypes, type]);
                  }
                }}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-[#664930] border-[#523a26] text-white font-bold"
                    : "bg-white border-[#CCBEB1] text-[#664930] hover:bg-[#FFDBBB]"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Resume Summary Section */}
      <div className="pt-4 border-t border-[#CCBEB1]/60 space-y-4 flex-1 overflow-y-auto">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#664930] flex items-center gap-1.5">
          <User className="w-3 h-3 text-[#664930]" />
          Active Profile Summary
        </span>

        {profile ? (
          <div className="bg-white border border-[#CCBEB1] rounded-2xl p-4 space-y-3 text-xs">
            <div>
              <span className="text-[#997E67] text-[10px] font-mono block">Candidate Name</span>
              <span className="font-bold text-[#664930] block">{profile.fullName || "Candidate"}</span>
              <span className="text-[10px] text-[#997E67] font-mono">{profile.email}</span>
            </div>

            <div>
              <span className="text-[#997E67] text-[10px] font-mono block mb-1">Core Skill Taxonomy</span>
              <div className="flex flex-wrap gap-1">
                {profile.coreSkills?.slice(0, 10).map((skill) => (
                  <span
                    key={skill}
                    className="bg-[#FFDBBB] border border-[#CCBEB1] text-[#664930] text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {profile.education && profile.education.length > 0 && (
              <div>
                <span className="text-[#997E67] text-[10px] font-mono block mb-1">Education</span>
                <span className="text-[11px] text-[#664930] block truncate font-semibold">{profile.education[0]}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-[#CCBEB1] rounded-2xl bg-[#FFFBF7] text-center">
            <span className="text-xs text-[#997E67]">No profile loaded yet. Upload a PDF resume to initialize.</span>
          </div>
        )}
      </div>
    </aside>
  );
}
