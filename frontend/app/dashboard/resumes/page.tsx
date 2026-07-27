"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit2,
  Trash2,
  FileText,
  Plus,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getUserEmail, getAuthHeaders } from "../../utils/auth";

interface ResumeVersion {
  id: number;
  versionName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parsedData: {
    fullName?: string;
    email?: string;
    phone?: string;
    skills?: any[];
    experienceYears?: number | string;
    education?: any[];
    projects?: any[];
    achievements?: any[];
    preferredRoles?: any[];
    targetRole?: string;
    experienceLevel?: string;
  };
}

export default function ResumeManagerPage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const email = getUserEmail();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions${emailParam}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data || []);
        if (data && data.length > 0 && expandedId === null) {
          setExpandedId(data[0].id);
        }
      }
    } catch (e: any) {
      setStatusMsg(`Error loading versions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const email = getUserEmail();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}/activate${emailParam}`, {
        method: "POST",
        headers: getAuthHeaders(),
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
      const email = getUserEmail();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}${emailParam}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
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
      const email = getUserEmail();
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${id}${emailParam}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
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
      const email = getUserEmail();
      if (email) {
        formData.append("userEmail", email);
      }

      try {
        const res = await fetch("/api/profile/upload-resume", {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        
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

  // Helper to format item cleanly without [object Object]
  const renderItemText = (item: any): string => {
    if (typeof item === "string") return item.trim();
    if (typeof item === "number" || typeof item === "boolean") return String(item);
    if (item && typeof item === "object") {
      const parts: string[] = [];
      if (item.degree || item.title || item.name || item.role) {
        parts.push(item.degree || item.title || item.name || item.role);
      }
      if (item.institution || item.university || item.school || item.company) {
        parts.push(item.institution || item.university || item.school || item.company);
      }
      if (item.year || item.duration || item.date) {
        parts.push(`(${item.year || item.duration || item.date})`);
      }
      if (item.description || item.summary || item.details) {
        parts.push(`- ${item.description || item.summary || item.details}`);
      }
      if (item.techStack && Array.isArray(item.techStack)) {
        parts.push(`[Stack: ${item.techStack.join(", ")}]`);
      }
      if (parts.length > 0) return parts.join(" ");
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    }
    return "";
  };

  // Helper to format experience string
  const formatExperience = (exp?: number | string) => {
    const num = typeof exp === "number" ? exp : parseFloat(String(exp || "0"));
    if (num > 0) {
      return `${num} ${num === 1 ? "Year" : "Years"} Experience`;
    }
    return "Entry Level / Academic (0-1 Years)";
  };

  // Helper to resolve preferred roles
  const resolveRoles = (data: ResumeVersion["parsedData"]) => {
    if (data.preferredRoles && data.preferredRoles.length > 0) {
      return data.preferredRoles.map(r => renderItemText(r)).filter(Boolean);
    }
    if (data.targetRole) {
      return [renderItemText(data.targetRole)];
    }
    if (data.skills && data.skills.length > 0) {
      const skillStr = data.skills.map(s => renderItemText(s)).join(" ").toLowerCase();
      const inferred: string[] = [];
      if (skillStr.includes("react") || skillStr.includes("javascript") || skillStr.includes("html")) {
        inferred.push("Software Engineer", "Frontend Developer");
      } else if (skillStr.includes("python") || skillStr.includes("c++") || skillStr.includes("java")) {
        inferred.push("Software Engineer", "Backend Developer");
      } else {
        inferred.push("Software Engineer");
      }
      return inferred;
    }
    return ["Software Engineer"];
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
              <span className="text-xs font-mono font-semibold text-[#2563EB] uppercase">MULTI-VERSION VAULT</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Resume Version Manager
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Complete view of all extracted technical taxonomies, candidate metadata, and role variations.
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
              const roles = resolveRoles(data);
              const isExpanded = expandedId === v.id;

              return (
                <div
                  key={v.id}
                  className={`rounded-2xl border transition-all duration-200 bg-[#111827] overflow-hidden ${
                    v.isActive
                      ? "border-[#2563EB] shadow-xl shadow-[#2563EB]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-[#2563EB] shrink-0">
                        <FileText className="w-6 h-6" />
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
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg shadow-sm">
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

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        className="text-zinc-400 hover:text-white p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs"
                      >
                        <span>{isExpanded ? "Collapse" : "View All Details"}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Strip */}
                  <div className="p-6 bg-[#09090B]/40 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Candidate Identity */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Candidate Identity</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <User className="w-4 h-4 text-[#2563EB]" />
                        <span>{data.fullName ? renderItemText(data.fullName) : "Candidate Profile"}</span>
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3 mt-1">
                        {data.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            {renderItemText(data.email)}
                          </span>
                        )}
                        {data.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            {renderItemText(data.phone)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Target Roles */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Target & Preferred Roles</span>
                      <div className="flex flex-wrap gap-1.5">
                        {roles.map((role, idx) => (
                          <span key={idx} className="bg-[#2563EB]/15 border border-[#2563EB]/40 text-[#2563EB] text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Seniority & Experience */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Seniority & Experience Level</span>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#10B981]" />
                        <span>{formatExperience(data.experienceYears)}</span>
                      </div>
                      {data.experienceLevel && (
                        <span className="text-xs text-zinc-400 block">{renderItemText(data.experienceLevel)}</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Full Details Section */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 bg-[#09090B]/70">
                      {/* Core Technical Skills */}
                      <div>
                        <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2563EB]" />
                          Extracted Technical Skills & Stack ({data.skills?.length || 0})
                        </h4>
                        {data.skills && data.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {data.skills.map((skill, idx) => {
                              const skillText = renderItemText(skill);
                              if (!skillText) return null;
                              return (
                                <span key={idx} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono px-2.5 py-1 rounded-md">
                                  {skillText}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No skills extracted</span>
                        )}
                      </div>

                      {/* Education */}
                      <div>
                        <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                          Education & Qualifications
                        </h4>
                        {data.education && data.education.length > 0 ? (
                          <div className="space-y-2">
                            {data.education.map((edu, idx) => {
                              const text = renderItemText(edu);
                              if (!text) return null;
                              return (
                                <div key={idx} className="bg-[#111827] p-3 rounded-xl border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
                                  <span className="text-purple-400 font-bold">•</span>
                                  <span>{text}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No education items recorded</span>
                        )}
                      </div>

                      {/* Projects */}
                      <div>
                        <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-3 flex items-center gap-2">
                          <FolderGit2 className="w-4 h-4 text-emerald-400" />
                          Projects & Technical Accomplishments
                        </h4>
                        {data.projects && data.projects.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.projects.map((proj, idx) => {
                              const text = renderItemText(proj);
                              if (!text) return null;
                              return (
                                <div key={idx} className="bg-[#111827] p-3.5 rounded-xl border border-white/5 text-xs text-zinc-300">
                                  <span className="text-emerald-400 font-bold block mb-1">Project #{idx + 1}</span>
                                  <p className="text-zinc-300 leading-relaxed">{text}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No project entries recorded</span>
                        )}
                      </div>

                      {/* Achievements */}
                      {data.achievements && data.achievements.length > 0 && (
                        <div>
                          <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" />
                            Extracted Achievements & Certifications
                          </h4>
                          <div className="space-y-2">
                            {data.achievements.map((ach, idx) => {
                              const text = renderItemText(ach);
                              if (!text) return null;
                              return (
                                <div key={idx} className="bg-[#111827] p-3 rounded-xl border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
                                  <span className="text-amber-400 font-bold">🏆</span>
                                  <span>{text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
