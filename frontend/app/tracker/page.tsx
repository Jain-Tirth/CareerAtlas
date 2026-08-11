"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { BoardView } from "@/app/components/tracker/BoardView";
import { ListView } from "@/app/components/tracker/ListView";
import { JobEditorModal } from "@/app/components/tracker/JobEditorModal";
import { KpiRow } from "@/app/components/tracker/KpiRow";
import { TrackerToolbar } from "@/app/components/tracker/TrackerToolbar";
import { JobsProvider, useJobs } from "@/app/state/JobsProvider";
import { PHASE_LABELS, type Job, type JobDraft, type JobPhase } from "@/app/state/jobs";

function ImportModal({ onClose }: { onClose: () => void }) {
  const { importJson, importCsv } = useJobs();
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({ title: "title", company: "company", location: "location", url: "url", notes: "notes", tags: "tags", phase: "phase", salaryMin: "salaryMin", salaryMax: "salaryMax" });
  const [result, setResult] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const pickColumns = async (f: File) => {
    const text = await f.text();
    const firstLine = text.split(/\r?\n/)[0] ?? "";
    setColumns(firstLine.split(",").map((c) => c.trim()).filter(Boolean));
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    if (f) void pickColumns(f);
  };

  const doImport = async () => {
    if (!file) return;
    if (file.name.toLowerCase().endsWith(".csv")) {
      const m: Record<string, string> = {};
      for (const col of columns) if (mapping[col]) m[col] = mapping[col];
      const r = await importCsv(file, m);
      setResult(`Imported ${r.imported}, skipped ${r.skipped} duplicate${r.skipped === 1 ? "" : "s"}, ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}.`);
    } else {
      const text = await file.text();
      const parsed = JSON.parse(text) as JobDraft[];
      const r = await importJson(parsed);
      setResult(`Imported ${r.imported}, skipped ${r.skipped} duplicate${r.skipped === 1 ? "" : "s"}, ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#664930]/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Import jobs">
      <div className="bg-white border border-[#CCBEB1] rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#664930]">Import Jobs</h2>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-lg hover:bg-[#FFDBBB]/50 flex items-center justify-center text-[#997E67]">✕</button>
        </div>
        <p className="text-xs text-[#997E67]">Upload a JSON export from this tracker, or a CSV with a header row. CSV columns are mapped to fields below.</p>
        <input type="file" accept=".json,.csv" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {file && file.name.toLowerCase().endsWith(".csv") && columns.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {columns.map((col) => (
              <label key={col} className="flex items-center gap-2 text-xs">
                <span className="w-36 truncate text-[#997E67]">{col}</span>
                <select value={mapping[col] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value }))} className="flex-1 text-xs bg-white border border-[#CCBEB1] rounded-lg px-2 py-1">
                  <option value="">(ignore)</option>
                  <option value="title">Title *</option>
                  <option value="company">Company *</option>
                  <option value="location">Location</option>
                  <option value="url">URL</option>
                  <option value="notes">Notes</option>
                  <option value="tags">Tags (comma-separated)</option>
                  <option value="phase">Phase</option>
                  <option value="salaryMin">Salary Min</option>
                  <option value="salaryMax">Salary Max</option>
                </select>
              </label>
            ))}
          </div>
        )}
        {result && <p className="text-xs font-bold text-[#664930]">{result}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-xs font-bold text-[#997E67] px-4 py-2 rounded-xl hover:bg-[#FFDBBB]/40">Cancel</button>
          <button onClick={() => void doImport()} disabled={!file} className="text-xs font-extrabold bg-[#664930] hover:bg-[#523a26] disabled:opacity-50 text-white px-5 py-2 rounded-xl">Import</button>
        </div>
      </div>
    </div>
  );
}

function TrackerContent() {
  const { view } = useJobs();
  const [editor, setEditor] = useState<{ job: Job | null; phase: JobPhase } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#664930]">Job Tracker</h1>
            <p className="text-xs text-[#997E67]">
              {PHASE_LABELS[editor?.phase ?? "bookmarked"]} phase
            </p>
          </div>
        </div>
        <TrackerToolbar onAddJob={(phase) => setEditor({ job: null, phase })} onOpenImport={() => setImportOpen(true)} />
        <KpiRow />
        {view === "board" ? (
          <BoardView onOpen={(job) => setEditor({ job, phase: job.phase })} onAdd={(phase) => setEditor({ job: null, phase })} />
        ) : (
          <ListView onOpen={(job) => setEditor({ job, phase: job.phase })} />
        )}
      </div>
      {editor && <JobEditorModal job={editor.job} phase={editor.phase} onClose={() => setEditor(null)} />}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </AppShell>
  );
}

export default function TrackerPage() {
  return (
    <JobsProvider>
      <TrackerContent />
    </JobsProvider>
  );
}
