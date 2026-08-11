"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Job, JobPhase } from "@/app/state/jobs";
import { PHASE_LABELS } from "@/app/state/jobs";
import { JobCard } from "./JobCard";

interface PhaseColumnProps {
  phase: JobPhase;
  jobs: Job[];
  onOpen: (job: Job) => void;
  onAdd: (phase: JobPhase) => void;
}

export function PhaseColumn({ phase, jobs, onOpen, onAdd }: PhaseColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${phase}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-72 max-w-96 rounded-2xl border p-3 flex flex-col h-full ${
        isOver ? "border-[#664930] bg-[#FFDBBB]/30" : "border-[#CCBEB1] bg-[#FFFBF7]"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#664930]">{PHASE_LABELS[phase]}</span>
          <span className="text-[10px] font-mono bg-white border border-[#CCBEB1] text-[#997E67] px-1.5 py-0.5 rounded">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(phase)}
          aria-label={`Add job to ${PHASE_LABELS[phase]}`}
          className="w-6 h-6 rounded-lg border border-[#CCBEB1] bg-white text-[#997E67] hover:bg-[#FFDBBB] hover:text-[#664930] transition-colors flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 overflow-y-auto flex-1 min-h-[2rem]">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onOpen={onOpen} />
          ))}
          {jobs.length === 0 && (
            <div className="text-[11px] text-[#997E67] italic border border-dashed border-[#CCBEB1] rounded-xl text-center py-3">
              Drop jobs here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
