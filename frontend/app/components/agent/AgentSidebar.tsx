"use client";

import React from "react";
import Link from "next/link";
import { Plus, FileText, History, Layers, ChevronRight, LogOut } from "lucide-react";

import { CareerAtlasLogoMark } from "@/components/ui/CareerAtlasLogoMark";
import { logout } from "../../utils/auth";

export interface StoredVersion {
  id: number;
  versionName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SearchSession {
  id: string;
  title: string;
  jobCount: number;
  timestamp: string;
}

interface AgentSidebarProps {
  storedVersions: StoredVersion[];
  selectedVersionId: number | null;
  onSelectVersion: (id: number) => void;
  sessions: SearchSession[];
  onSelectSession?: (id: string) => void;
  onNewSearch: () => void;
  isSearching: boolean;
}

export default function AgentSidebar({
  storedVersions,
  selectedVersionId,
  onSelectVersion,
  sessions,
  onSelectSession,
  onNewSearch,
  isSearching,
}: AgentSidebarProps) {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-full lg:w-72 bg-[#FFFBF7] border-r border-[#CCBEB1] p-5 flex flex-col justify-between shrink-0 h-full min-h-[calc(100vh-4rem)] space-y-6 font-sans">
      <div className="space-y-6">
        {/* Top Header & Brand Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]/60">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CareerAtlasLogoMark size={32} showText />
          </Link>
        </div>

        {/* New Search Action */}
        <button
          onClick={onNewSearch}
          disabled={isSearching}
          className="w-full bg-[#664930] hover:bg-[#523a26] disabled:bg-[#CCBEB1] disabled:text-[#997E67] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>New Agent Search</span>
        </button>

        {/* Resume Versions Vault Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#664930] flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#664930]" />
              Resume Versions ({storedVersions.length})
            </span>
            <Link
              href="/dashboard/resumes"
              className="text-[10px] text-[#997E67] hover:text-[#664930] font-mono transition-colors"
            >
              Vault →
            </Link>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
            {storedVersions.length === 0 ? (
              <span className="text-[11px] text-[#997E67] italic block p-2 border border-dashed border-[#CCBEB1] rounded-xl text-center">
                No stored versions yet.
              </span>
            ) : (
              storedVersions.map((v) => {
                const isSelected = selectedVersionId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVersion(v.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 font-sans ${
                      isSelected
                        ? "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930] font-bold shadow-xs"
                        : "bg-white border-[#CCBEB1] text-[#997E67] hover:border-[#664930] hover:text-[#664930]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-[#664930]" : "text-[#997E67]"}`} />
                      <span className="truncate">{v.versionName}</span>
                    </div>
                    {v.isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#664930] shrink-0" title="Active Version" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Previous Agent Search Sessions */}
        <div className="space-y-3 font-sans">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#664930] flex items-center gap-1.5">
            <History className="w-3 h-3 text-[#664930]" />
            Search History
          </span>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
            {sessions.length === 0 ? (
              <span className="text-[11px] text-[#997E67] italic block p-2 border border-dashed border-[#CCBEB1] rounded-xl text-center">
                No previous searches recorded.
              </span>
            ) : (
              sessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => onSelectSession?.(sess.id)}
                  className="w-full text-left p-2.5 rounded-xl border border-[#CCBEB1] bg-white hover:bg-[#FFDBBB]/40 text-[#664930] transition-all flex items-center justify-between gap-2 group font-sans"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-[#664930] truncate block transition-colors">
                      {sess.title}
                    </span>
                    <span className="text-[10px] text-[#997E67] block">
                      Found {sess.jobCount} Jobs • {sess.timestamp}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#997E67] group-hover:text-[#664930] transition-colors shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation - Logout Button */}
      <div className="pt-4 border-t border-[#CCBEB1]/60 font-sans">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs font-bold text-[#664930] hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all group font-sans"
        >
          <LogOut className="w-4 h-4 text-[#997E67] group-hover:text-red-700 transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
