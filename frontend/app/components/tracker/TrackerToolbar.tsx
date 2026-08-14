"use client";

import { LayoutGrid, List, Plus, Search, Download, Upload } from "lucide-react";
import type { JobPhase } from "@/app/state/jobs";
import { useJobs } from "@/app/state/JobsProvider";

export function TrackerToolbar({ onAddJob, onOpenImport }: { onAddJob: (phase: JobPhase) => void; onOpenImport: () => void }) {
  const { filters, setFilters, view, setView, exportData, syncStatus } = useJobs();

  const filterRow = "flex items-center gap-2 bg-white border border-[#CCBEB1] rounded-xl px-3 py-1.5";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-[#FFFBF7] border border-[#CCBEB1] rounded-xl p-0.5">
          <button onClick={() => setView("board")} aria-pressed={view === "board"} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${view === "board" ? "bg-[#664930] text-white" : "text-[#997E67] hover:text-[#664930]"}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Board
          </button>
          <button onClick={() => setView("list")} aria-pressed={view === "list"} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${view === "list" ? "bg-[#664930] text-white" : "text-[#997E67] hover:text-[#664930]"}`}>
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>

        <div className={`${filterRow} flex-1 min-w-40`}>
          <Search className="w-3.5 h-3.5 text-[#997E67]" />
          <input
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search jobs, companies, tags..."
            className="text-sm bg-transparent outline-none w-full text-[#664930] placeholder:text-[#CCBEB1]"
          />
        </div>

        {syncStatus !== "synced" && (
          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border ${
            syncStatus === "syncing"
              ? "text-[#997E67] border-[#CCBEB1] bg-[#FFFBF7]"
              : "text-[#C65D52] border-[#C65D52]/40 bg-[#C65D52]/10"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === "syncing" ? "bg-[#997E67] animate-pulse" : "bg-[#C65D52]"}`} />
            {syncStatus === "syncing" ? "Syncing..." : syncStatus === "offline" ? "Offline" : "Sync error"}
          </span>
        )}

        <button onClick={() => void exportData("json")} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#CCBEB1] bg-white text-[#997E67] hover:text-[#664930]">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button onClick={onOpenImport} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#CCBEB1] bg-white text-[#997E67] hover:text-[#664930]">
          <Upload className="w-3.5 h-3.5" /> Import
        </button>
        <button
          onClick={() => onAddJob("bookmarked")}
          className="flex items-center gap-1.5 text-xs font-extrabold bg-[#664930] hover:bg-[#523a26] text-white px-4 py-2 rounded-xl shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Add Job
        </button>
      </div>
    </div>
  );
}
