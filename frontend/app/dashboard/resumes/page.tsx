"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit2, Trash2, FileText, Plus, Sparkles, Layers, ShieldCheck } from "lucide-react";

interface ResumeVersion {
  id: number;
  versionName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parsedData: {
    fullName: string;
    email: string;
    phone?: string;
    skills: string[];
    experienceYears: number;
    education: string[];
    projects: string[];
    achievements: string[];
    preferredRoles: string[];
  };
}

export default function ResumeManagerPage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("user_email") || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data || []);
      }
    } catch (e: any) {
      setStatusMsg(`Error loading versions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const email = localStorage.getItem("user_email") || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}/activate${emailParam}`, {
        method: "POST",
      });
      if (res.ok) {
        setStatusMsg("Successfully set version as active!");
        fetchVersions();
      } else {
        throw new Error(await res.text());
      }
    } catch (e: any) {
      setStatusMsg(`Failed to activate version: ${e.message}`);
    }
  };

  const handleStartRename = (v: ResumeVersion) => {
    setEditingId(v.id);
    setEditName(v.versionName);
  };

  const handleSaveRename = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const email = localStorage.getItem("user_email") || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}${emailParam}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionName: editName.trim() }),
      });
      if (res.ok) {
        setStatusMsg("Successfully renamed version!");
        setEditingId(null);
        fetchVersions();
      } else {
        throw new Error(await res.text());
      }
    } catch (e: any) {
      setStatusMsg(`Failed to rename version: ${e.message}`);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const email = localStorage.getItem("user_email") || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}${emailParam}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatusMsg("Successfully deleted version.");
        fetchVersions();
      } else {
        throw new Error(await res.text());
      }
    } catch (e: any) {
      setStatusMsg(`Failed to delete version: ${e.message}`);
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setStatusMsg(`Uploading "${file.name}"...`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/profile/upload-resume", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        
        // Listen to SSE status stream until completed
        const eventSource = new EventSource(`/api/profile/parse-status/${data.taskId}`);
        eventSource.onmessage = (event) => {
          const sse = JSON.parse(event.data);
          if (sse.status === "success") {
            eventSource.close();
            setUploading(false);
            setStatusMsg(`Successfully processed and saved "${file.name}"!`);
            fetchVersions();
          } else if (sse.status === "error") {
            eventSource.close();
            setUploading(false);
            setStatusMsg(`Error: ${sse.errorDetails}`);
          }
        };
        eventSource.onerror = () => {
          eventSource.close();
          setUploading(false);
          fetchVersions();
        };
      } catch (err: any) {
        setUploading(false);
        setStatusMsg(`Upload failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-blue-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#2563EB]/20">
              CA
            </div>
            <span className="font-bold text-white tracking-tight">CareerAtlas</span>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
              RESUME VAULT
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/80 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-[#2563EB] uppercase">MULTI-VERSION MANAGEMENT</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Resume Version Manager
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Store, rename, activate, and switch between role-targeted resume variations without re-uploading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563EB]/20 active:scale-95">
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing PDF...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Upload New Version</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleDirectUpload}
                    disabled={uploading}
                  />
                </>
              )}
            </label>
          </div>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#111827] border border-[#2563EB]/40 text-xs font-mono text-blue-300 flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg("")} className="text-zinc-500 hover:text-white">✕</button>
          </div>
        )}

        {/* Versions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
            <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-zinc-500">Loading stored resume versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-center">
            <FileText className="w-12 h-12 text-zinc-700 mb-3" />
            <span className="text-sm font-bold text-white mb-1">No Resume Versions Saved Yet</span>
            <span className="text-xs text-zinc-500 max-w-sm">
              Upload your first PDF resume above to create a version record in your account.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {versions.map((v) => {
              const isEditing = editingId === v.id;
              const data = v.parsedData || {};

              return (
                <div
                  key={v.id}
                  className={`p-6 rounded-2xl border transition-all duration-200 bg-[#111827] ${
                    v.isActive
                      ? "border-[#2563EB] shadow-xl shadow-[#2563EB]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-[#09090B] border border-[#2563EB] rounded px-3 py-1 text-sm text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(v.id)}
                              className="bg-[#2563EB] text-white p-1.5 rounded hover:bg-blue-500"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-zinc-800 text-zinc-400 p-1.5 rounded hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-bold text-white truncate">
                              {v.versionName}
                            </h3>
                            <button
                              onClick={() => handleStartRename(v)}
                              className="text-zinc-500 hover:text-white transition-colors"
                              title="Rename Version"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <span className="text-xs text-zinc-500 font-mono block mt-0.5">
                          Uploaded: {new Date(v.createdAt).toLocaleDateString()} • Updated: {new Date(v.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions & Status Badge */}
                    <div className="flex items-center gap-3">
                      {v.isActive ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          PRIMARY / ACTIVE
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(v.id)}
                          className="bg-zinc-800 hover:bg-[#2563EB] text-zinc-300 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          Set as Active
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(v.id, v.versionName)}
                        className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/30 transition-colors"
                        title="Delete Version"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Taxonomy Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="bg-[#09090B]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Extracted Preferred Roles</span>
                      <div className="text-xs font-bold text-white">
                        {data.preferredRoles?.length ? data.preferredRoles.join(", ") : "Not specified"}
                      </div>
                    </div>

                    <div className="bg-[#09090B]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Seniority & Experience</span>
                      <div className="text-xs font-bold text-white">
                        {data.experienceYears ? `${data.experienceYears} Years Experience` : "Entry / Not calculated"}
                      </div>
                    </div>

                    <div className="bg-[#09090B]/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Extracted Core Stack</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.skills?.slice(0, 8).map((skill: string) => (
                          <span key={skill} className="bg-zinc-800 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {data.skills?.length > 8 && (
                          <span className="text-[10px] text-zinc-500 font-mono self-center">
                            +{data.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
