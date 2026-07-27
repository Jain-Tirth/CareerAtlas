"use client";

import React from "react";
import Link from "next/link";
import { Plus, FileText, History, Layers, ChevronRight, Sparkles, ArrowLeft, LogOut } from "lucide-react";

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
  return (
    <aside className="w-full lg:w-72 bg-[#09090B] border-r border-white/10 p-5 flex flex-col justify-between shrink-0 h-full min-h-[calc(100vh-4rem)] space-y-6 font-sans">
      <div className="space-y-6">
        {/* Top Header & Brand Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              CA
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight text-sm">CareerAtlas</span>
              <span className="text-[9px] font-mono text-blue-400 font-semibold tracking-wider uppercase">
                AI AGENT WORKSPACE
              </span>
            </div>
          </Link>
        </div>

        {/* New Search Action */}
        <button
          onClick={onNewSearch}
          disabled={isSearching}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Agent Search</span>
        </button>

        {/* Resume Versions Vault Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-blue-400" />
              Resume Versions ({storedVersions.length})
            </span>
            <Link
              href="/dashboard/resumes"
              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono transition-colors"
            >
              Vault →
            </Link>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
            {storedVersions.length === 0 ? (
              <span className="text-[11px] text-zinc-600 italic block p-2 border border-dashed border-zinc-850 rounded-xl text-center">
                No stored versions yet.
              </span>
            ) : (
              storedVersions.map((v) => {
                const isSelected = selectedVersionId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVersion(v.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500/50 text-white shadow-md shadow-blue-500/10 font-bold"
                        : "bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-zinc-500"}`} />
                      <span className="truncate">{v.versionName}</span>
                    </div>
                    {v.isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active Version" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Previous Agent Search Sessions */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <History className="w-3 h-3 text-emerald-400" />
            Search History
          </span>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
            {sessions.length === 0 ? (
              <span className="text-[11px] text-zinc-600 italic block p-2 border border-dashed border-zinc-850 rounded-xl text-center">
                No previous searches recorded.
              </span>
            ) : (
              sessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => onSelectSession?.(sess.id)}
                  className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-[#111827]/40 hover:bg-[#111827] hover:border-white/10 text-zinc-300 transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-white truncate block group-hover:text-blue-400 transition-colors">
                      {sess.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      Found {sess.jobCount} Jobs • {sess.timestamp}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Workspace</span>
        </Link>
      </div>
    </aside>
  );
}
