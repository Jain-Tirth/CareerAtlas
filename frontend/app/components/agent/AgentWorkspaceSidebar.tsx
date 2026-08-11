"use client";

import React from "react";
import { Plus } from "lucide-react";

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

interface AgentWorkspaceSidebarProps {
  onNewSearch: () => void;
  isSearching: boolean;
}

export default function AgentWorkspaceSidebar({ onNewSearch, isSearching }: AgentWorkspaceSidebarProps) {
  return (
    <div className="space-y-5">
      <button
        onClick={onNewSearch}
        disabled={isSearching}
        className="w-full bg-[#664930] hover:bg-[#523a26] disabled:bg-[#CCBEB1] disabled:text-[#997E67] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-sans"
      >
        <Plus className="w-4 h-4" />
        <span>New Agent Search</span>
      </button>
    </div>
  );
}
