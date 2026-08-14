"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { JOB_PHASES, PHASE_LABELS, type Job, type JobDraft, type JobPhase } from "@/app/state/jobs";
import { useJobs } from "@/app/state/JobsProvider";

interface JobEditorModalProps {
  job: Job | null;
  phase: JobPhase;
  onClose: () => void;
}

export function JobEditorModal({ job, phase, onClose }: JobEditorModalProps) {
  const { addJob, updateJob } = useJobs();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<JobPhase>(phase);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.title); setCompany(job.company); setLocation(job.location ?? "");
      setSalaryMin(job.salaryMin !== null ? String(job.salaryMin) : "");
      setSalaryMax(job.salaryMax !== null ? String(job.salaryMax) : "");
      setUrl(job.url ?? ""); setNotes(job.notes ?? ""); setTags(job.tags.join(", "));
      setSelectedPhase(job.phase);
    } else {
      setTitle(""); setCompany(""); setLocation(""); setSalaryMin(""); setSalaryMax("");
      setUrl(""); setNotes(""); setTags(""); setSelectedPhase(phase);
    }
    setError("");
    setTimeout(() => titleRef.current?.focus(), 0);
  }, [job, phase]);

  const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const buildDraft = (): JobDraft | null => {
    const t = title.trim();
    const c = company.trim();
    if (!t || !c) { setError("Title and company are required."); return null; }
    const min = salaryMin.trim() === "" ? null : parseInt(salaryMin, 10);
    const max = salaryMax.trim() === "" ? null : parseInt(salaryMax, 10);
    if (min !== null && max !== null && !isNaN(min) && !isNaN(max) && min > max) {
      setError("Minimum salary cannot exceed maximum salary."); return null;
    }
    return {
      title: t, company: c,
      location: location.trim() || null,
      salaryMin: min !== null && !isNaN(min) ? min : null,
      salaryMax: max !== null && !isNaN(max) ? max : null,
      url: url.trim() || null,
      notes: notes.trim() || null,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      phase: selectedPhase,
    };
  };

  const handleSave = async () => {
    const draft = buildDraft();
    if (!draft) return;
    if (job) await updateJob(job.id, draft);
    else await addJob(draft);
    onClose();
  };

  const inputCls = "w-full text-sm bg-white border border-[#CCBEB1] rounded-xl px-3 py-1.5 text-[#664930] focus:outline-none focus:ring-2 focus:ring-[#664930]/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#664930]/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={job ? "Edit job" : "Add job"}>
      <div className="bg-white border border-[#CCBEB1] rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#664930]">{job ? "Edit Job" : "Add Job"}</h2>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-lg hover:bg-[#FFDBBB]/50 flex items-center justify-center text-[#997E67]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="col-span-1 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Title *</span>
            <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Frontend Engineer" />
          </label>
          <label className="col-span-1 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Company *</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} placeholder="Acme Inc" />
          </label>
          <label className="col-span-2 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Remote / San Francisco" />
          </label>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Salary Min</span>
            <input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} inputMode="numeric" className={inputCls} placeholder="100000" />
          </label>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Salary Max</span>
            <input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} inputMode="numeric" className={inputCls} placeholder="150000" />
          </label>
          <label className="col-span-2 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://careers.acme.com/job/123" />
          </label>
          <label className="col-span-2 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Tags</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="react, remote, fintech" />
          </label>
          <label className="col-span-2 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} min-h-14 resize-y`} />
          </label>
          <label className="col-span-1 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#997E67]">Phase</span>
            <select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value as JobPhase)} className={inputCls}>
              {JOB_PHASES.map((p) => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
            </select>
          </label>
        </div>

        {error && <p className="text-xs font-bold text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="text-xs font-bold text-[#997E67] px-4 py-2 rounded-xl hover:bg-[#FFDBBB]/40 transition-colors">
            Cancel
          </button>
          <button onClick={() => void handleSave()} className="text-xs font-extrabold bg-[#664930] hover:bg-[#523a26] text-white px-5 py-2 rounded-xl transition-all shadow-md active:scale-95">
            {job ? "Save Changes" : "Add Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
