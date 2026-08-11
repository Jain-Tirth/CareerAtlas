"use client";

import { useJobs } from "@/app/state/JobsProvider";
import { JOB_PHASES, PHASE_LABELS, type JobPhase } from "@/app/state/jobs";

const PHASE_COLORS: Record<JobPhase, string> = {
  bookmarked: "bg-[#664930]",
  applied: "bg-[#8AAE86]",
  interviewing: "bg-[#D9A05B]",
  accepted: "bg-[#52796F]",
  rejected: "bg-[#C65D52]",
};

const ARROW_CLIP = "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)";

export function KpiRow() {
  const { jobs } = useJobs();
  const counts = JOB_PHASES.map((phase) => ({
    phase,
    count: jobs.filter((j) => j.phase === phase).length,
  }));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      <div style={{ clipPath: ARROW_CLIP }} className="bg-[#664930] text-white px-4 py-3 min-w-0">
        <div className="text-2xl font-extrabold leading-none">{jobs.length}</div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/70 mt-1">Total</div>
      </div>
      {counts.map(({ phase, count }) => (
        <div key={phase} style={{ clipPath: ARROW_CLIP }} className={`${PHASE_COLORS[phase]} text-white px-4 py-3 min-w-0`}>
          <div className="text-2xl font-extrabold leading-none">{count}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/70 mt-1">{PHASE_LABELS[phase]}</div>
        </div>
      ))}
    </div>
  );
}
