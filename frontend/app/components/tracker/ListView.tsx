"use client";

import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { JOB_PHASES, PHASE_LABELS, type Job, type JobPhase } from "@/app/state/jobs";
import { useJobs } from "@/app/state/JobsProvider";

function salaryLabel(job: Job): string | null {
  if (job.salaryMin === null && job.salaryMax === null) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (job.salaryMin !== null && job.salaryMax !== null) return `${fmt(job.salaryMin)}–${fmt(job.salaryMax)}`;
  return job.salaryMin !== null ? `${fmt(job.salaryMin)}+` : `Up to ${fmt(job.salaryMax ?? 0)}`;
}

export function ListView({ onOpen }: { onOpen: (job: Job) => void }) {
  const { jobs, moveJob } = useJobs();
  const sorted = useMemo(() => [...jobs].sort((a, b) => {
    const pa = JOB_PHASES.indexOf(a.phase);
    const pb = JOB_PHASES.indexOf(b.phase);
    if (pa !== pb) return pa - pb;
    return a.sortOrder - b.sortOrder;
  }), [jobs]);

  return (
    <div className="bg-white border border-[#CCBEB1] rounded-2xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#CCBEB1] bg-[#FFFBF7] text-[10px] font-mono uppercase tracking-wider text-[#997E67]">
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Salary</th>
            <th className="px-4 py-3">Saved</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((job) => (
            <tr key={job.id} onClick={() => onOpen(job)} className="border-b border-[#CCBEB1]/50 hover:bg-[#FFDBBB]/20 cursor-pointer">
              <td className="px-4 py-3 font-bold text-[#664930]">{job.title}</td>
              <td className="px-4 py-3 text-[#997E67]">{job.company}</td>
              <td className="px-4 py-3 text-[#997E67]">
                {job.location ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span> : <span className="text-[#CCBEB1]">—</span>}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[#664930]">{salaryLabel(job) ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-[#997E67]">{new Date(job.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono bg-[#FFFBF7] border border-[#CCBEB1]/70 text-[#997E67] px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={job.phase}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => moveJob(job.id, e.target.value as JobPhase, job.sortOrder)}
                  className="text-xs font-bold bg-white border border-[#CCBEB1] rounded-lg px-2 py-1.5 text-[#664930] focus:outline-none focus:ring-2 focus:ring-[#664930]/30"
                >
                  {JOB_PHASES.map((p) => (
                    <option key={p} value={p}>{PHASE_LABELS[p]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-[#997E67] italic">No jobs yet. Add your first job to get started.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
