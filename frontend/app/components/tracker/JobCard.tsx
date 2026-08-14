"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import type { Job } from "@/app/state/jobs";

function initials(company: string): string {
  return company.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function salaryLabel(job: Job): string | null {
  if (job.salaryMin === null && job.salaryMax === null) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (job.salaryMin !== null && job.salaryMax !== null) return `${fmt(job.salaryMin)}–${fmt(job.salaryMax)}`;
  return job.salaryMin !== null ? `${fmt(job.salaryMin)}+` : `Up to ${fmt(job.salaryMax ?? 0)}`;
}

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
}

export function JobCard({ job, onOpen }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isBookmarked = job.bookmarked;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(job)}
      className={`group bg-white border border-[#CCBEB1] rounded-xl p-3 shadow-xs cursor-pointer select-none ${
        isDragging ? "opacity-40" : "hover:border-[#664930]/50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#FFDBBB] border border-[#CCBEB1] flex items-center justify-center text-[#664930] font-extrabold text-xs shrink-0">
          {initials(job.company)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#664930] leading-snug break-words">{job.title}</h3>
          <p className="text-xs text-[#997E67] break-words mt-0.5">{job.company}</p>
          {job.location && (
            <p className="text-[11px] text-[#997E67] flex items-center gap-1 mt-0.5 break-words">
              <MapPin className="w-3 h-3 shrink-0" /> {job.location}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {salaryLabel(job) && (
            <span className="text-[10px] font-mono text-[#664930] bg-[#FFDBBB]/50 px-1.5 py-0.5 rounded">{salaryLabel(job)}</span>
          )}
          {isBookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-[#664930]" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-[#CCBEB1] group-hover:text-[#997E67]" />
          )}
        </div>
      </div>
      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {job.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono bg-[#FFFBF7] border border-[#CCBEB1]/70 text-[#997E67] px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      {job.notes && (
        <p className="text-[11px] text-[#997E67] mt-2 break-words whitespace-pre-wrap">{job.notes}</p>
      )}
      <div className="text-[10px] text-[#997E67] mt-2">{daysSince(job.createdAt) === 0 ? "Saved today" : `Saved ${daysSince(job.createdAt)}d ago`}</div>
    </div>
  );
}
