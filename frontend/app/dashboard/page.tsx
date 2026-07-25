"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ResumeWorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface ResumeProject {
  title: string;
  techStack: string[];
  description: string;
}

interface ParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  coreSkills: string[];
  experienceLevel: string;
  preferences?: {
    locations: string[];
    remote: boolean;
    employmentTypes?: string[];
    salaryExpectation?: number;
  };
  targetLocation: string;
  isRemoteOpen: boolean;
  experience: ResumeWorkExperience[];
  projects: ResumeProject[];
}

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "success" | "error";
  errorDetails?: string;
}

interface StoredVersion {
  id: number;
  versionName: string;
  isActive: boolean;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState<boolean>(false);
  const [profile, setProfile] = useState<ParsedProfile | null>(null);
  
  // Versions state
  const [storedVersions, setStoredVersions] = useState<StoredVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationPref, setLocationPref] = useState<string>("Ahmedabad");
  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(true);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(["Full-time"]);
  
  interface JobResult {
    id: number;
    jobId: string;
    company: string;
    title: string;
    location: string;
    source: string;
    url?: string;
    score: number;
    reasoning: string;
    status: string;
    createdAt: string;
    confidenceScore?: number;
    confidenceFactors?: {
      positive: string[];
      negative: string[];
    } | string;
  }

  // Status and logs
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [workflowRunning, setWorkflowRunning] = useState<boolean>(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  // Pipeline Flow steps state
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: "step-1", name: "1. Profile Sync & User Embedding", description: "Saves structured profile and uploads experience/achievements to user_embeddings", status: "idle" },
    { id: "step-2", name: "2. Scraper Discovery Ingestion", description: "Crawls LinkedIn and queries TinyFish API boards concurrently", status: "idle" },
    { id: "step-3", name: "3. Validation Layer Checks", description: "Filters duplicates, screens expired jobs, and HEAD-pings links", status: "idle" },
    { id: "step-4", name: "4. Structured JD Extraction", description: "Extracts required skills, experience, and remote status via LLM", status: "idle" },
    { id: "step-5", name: "5. Job Embedding & pgvector", description: "Stores job records and 384-dimension vector embeddings in DB", status: "idle" },
    { id: "step-6", name: "6. Multi-Stage Match Engines", description: "Applies Hard Filters, Skill Aliases, and Cosine Vector Similarity", status: "idle" },
    { id: "step-7", name: "7. Weighted Ranking & Telegram Alerts", description: "Combines matching scores and dispatches top alerts to Telegram", status: "idle" },
  ]);

  // Load existing profile & versions on mount
  useEffect(() => {
    fetchProfile().then(() => {
      fetchResults();
      fetchVersions();
    });
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const fetchVersions = async () => {
    try {
      const email = localStorage.getItem("user_email") || profile?.email || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        setStoredVersions(data || []);
        const active = data?.find((v: any) => v.isActive);
        if (active) {
          setSelectedVersionId(active.id);
        }
      }
    } catch (e) {
      // Ignore version fetch error
    }
  };

  const handleSelectStoredVersion = async (versionId: number) => {
    setSelectedVersionId(versionId);
    setParsing(true);
    const selectedName = storedVersions.find(v => v.id === versionId)?.versionName || versionId;
    addLog(`Activating stored resume version "${selectedName}"...`);
    try {
      const email = localStorage.getItem("user_email") || profile?.email || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/versions/${versionId}/activate${emailParam}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const mapped = mapBackendProfileToParsedProfile(data.profile);
          setProfile(mapped);
          setLocationPref(mapped.targetLocation || "Ahmedabad");
          setIsRemoteOpen(mapped.isRemoteOpen ?? true);
          addLog(`Activated resume version "${selectedName}" successfully!`);
          fetchSuggestions(mapped.email);
          fetchResults(mapped.email);
          fetchVersions();
        }
      } else {
        throw new Error(await res.text());
      }
    } catch (e: any) {
      addLog(`Error activating version: ${e.message}`);
    } finally {
      setParsing(false);
    }
  };

  const fetchResults = async (email?: string) => {
    setLoadingResults(true);
    try {
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/agent/results${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data || []);
      }
    } catch (e: any) {
      addLog(`Error loading recommendation results: ${e.message}`);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your matched jobs history and reset all caches? This cannot be undone.")) {
      return;
    }
    setLoadingResults(true);
    try {
      const res = await fetch("/api/agent/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile?.email }),
      });
      if (res.ok) {
        addLog("Successfully cleared job match history and scraper cache.");
        setResults([]);
      } else {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }
    } catch (e: any) {
      addLog(`Error clearing history: ${e.message}`);
    } finally {
      setLoadingResults(false);
    }
  };

  const mapBackendProfileToParsedProfile = (data: any): ParsedProfile => {
    return {
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      targetRole: data.targetRole || data.preferredRoles?.[0] || "",
      coreSkills: data.coreSkills || data.skills || [],
      experienceLevel: data.experienceLevel || (data.experienceYears !== undefined ? `${data.experienceYears} years` : ""),
      preferences: data.preferences ? {
        locations: data.preferences.locations || [],
        remote: data.preferences.remote ?? true,
        employmentTypes: data.preferences.employmentTypes || [],
      } : undefined,
      targetLocation: data.targetLocation || data.preferences?.locations?.[0] || "Ahmedabad",
      isRemoteOpen: data.isRemoteOpen ?? data.preferences?.remote ?? true,
      experience: data.experience || [],
      projects: data.projects || [],
    };
  };

  const fetchProfile = async () => {
    try {
      const email = localStorage.getItem("user_email") || "";
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.fullName && data.fullName !== "Default User" && data.fullName !== "No Resume Uploaded") {
          const mapped = mapBackendProfileToParsedProfile(data);
          setProfile(mapped);
          setLocationPref(mapped.targetLocation || "Ahmedabad");
          setIsRemoteOpen(mapped.isRemoteOpen ?? true);
          if (mapped.preferences?.employmentTypes && mapped.preferences.employmentTypes.length > 0) {
            setEmploymentTypes(mapped.preferences.employmentTypes);
          }
          addLog("Loaded existing profile from backend cache.");
          fetchSuggestions(mapped.email);
          fetchResults(mapped.email);
          fetchVersions();
        }
      }
    } catch (e) {
      // Ignore initial load error if server is not up yet
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      addLog(`Selected file: ${e.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setParsing(true);
    addLog(`Uploading PDF resume "${file.name}" for extraction...`);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to upload and parse resume.");
      }

      const uploadRes = await res.json();
      const taskId = uploadRes.taskId;
      addLog(`Resume uploaded successfully. Task ID: ${taskId}. Initiating parsing status stream...`);

      const eventSource = new EventSource(`/api/profile/parse-status/${taskId}`);

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "ping" || data.status === "heartbeat") {
            return;
          }
          addLog(`[Parsing progress] ${data.log}`);

          if (data.status === "success") {
            eventSource.close();
            const mapped = mapBackendProfileToParsedProfile(data.profile);
            if (mapped.email) {
              localStorage.setItem("user_email", mapped.email);
            }
            setProfile(mapped);
            setLocationPref(mapped.targetLocation || "Ahmedabad");
            setIsRemoteOpen(mapped.isRemoteOpen ?? true);
            if (mapped.preferences?.employmentTypes && mapped.preferences.employmentTypes.length > 0) {
              setEmploymentTypes(mapped.preferences.employmentTypes);
            }
            addLog(`Resume parsed and saved as version for ${mapped.fullName}!`);
            setParsing(false);
            setFile(null);

            fetchSuggestions(mapped.email);
            fetchResults(mapped.email);
            fetchVersions();
          } else if (data.status === "error") {
            eventSource.close();
            addLog(`Error parsing resume: ${data.errorDetails}`);
            setParsing(false);
          }
        } catch (err: any) {
          eventSource.close();
          addLog(`Error parsing stream event: ${err.message}`);
          setParsing(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        addLog("EventSource connection to parsing status stream closed or failed.");
        setParsing(false);
      };
    } catch (e: any) {
      addLog(`Error parsing resume: ${e.message}`);
      setParsing(false);
    }
  };

  const fetchSuggestions = async (email?: string) => {
    setLoadingSuggestions(true);
    addLog("Requesting recommended job titles based on your active resume...");
    try {
      const activeEmail = email || profile?.email;
      const emailParam = activeEmail ? `?email=${encodeURIComponent(activeEmail)}` : "";
      const res = await fetch(`/api/profile/suggest-titles${emailParam}`);
      if (!res.ok) throw new Error("Could not load recommendations.");
      const data = await res.json();
      setSuggestions(data.searchTerms || []);
      addLog(`Generated ${data.searchTerms?.length || 0} suggested search titles.`);
    } catch (e: any) {
      addLog(`Error loading title recommendations: ${e.message}`);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleTriggerWorkflow = async () => {
    if (!searchTerm.trim()) {
      addLog("Cannot trigger search: No search title specified.");
      alert("Please specify a target job search title.");
      return;
    }

    setWorkflowRunning(true);
    addLog("Starting CareerAtlas recommendation pipeline...");
    
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: "idle", errorDetails: undefined })));

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchTerms: [searchTerm.trim()],
          locationPreference: locationPref,
          isRemoteOpen,
          userEmail: profile?.email,
          employmentTypes,
          salaryExpectation: null,
        }),
      });

      if (!res.ok) {
        const errMsg = await res.text() || "Failed to start scraping suite.";
        throw new Error(errMsg);
      }

      const result = await res.json();
      addLog(`Backend Response: ${result.message}`);
      addLog("Starting real-time execution tracking polling...");

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/agent/status");
          if (statusRes.ok) {
            const backendStatus = await statusRes.json();
            
            setPipelineSteps(prev => prev.map(step => {
              const backendStep = backendStatus.steps[step.id];
              if (backendStep) {
                return {
                  ...step,
                  status: backendStep.status,
                  errorDetails: backendStep.errorDetails
                };
              }
              return step;
            }));

            if (backendStatus.logs && backendStatus.logs.length > 0) {
              setLogs(backendStatus.logs);
            }

            if (!backendStatus.active) {
              clearInterval(pollInterval);
              setWorkflowRunning(false);
              addLog("Real-time pipeline run completed.");
              fetchResults(profile?.email);
            }
          }
        } catch (pollErr: any) {
          // Ignore polling errors
        }
      }, 1000);

    } catch (e: any) {
      addLog(`Pipeline Aborted: ${e.message}`);
      setPipelineSteps(prev => prev.map(s => 
        s.status === "running" ? { ...s, status: "error", errorDetails: e.message } : s
      ));
      setWorkflowRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              CA
            </div>
            <span className="font-bold text-white tracking-tight">CareerAtlas</span>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">APP DASHBOARD</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/resumes"
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>Resumes</span>
              <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800/40 font-mono">VAULT</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Overview
            </Link>
          </div>
        </div>
      </nav>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/70 via-zinc-950 to-zinc-950 -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/80 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">CareerAtlas Engine v1.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Autonomous Ingestion & Search Pipeline
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Select or upload a resume version, verify match criteria, and launch parallel job discovery.
            </p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Steps & Config */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Step 1: Resume Selection & Upload */}
            <section className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50 group-hover:bg-blue-500 transition-colors" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-300">1</span>
                  Resume Ingestion & Version Selection
                </h2>
                {profile && (
                  <span className="text-xs bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium">
                    Profile Loaded
                  </span>
                )}
              </div>

              {/* Version Selector Dropdown if stored versions exist */}
              {storedVersions.length > 0 && (
                <div className="mb-5 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Select Stored Resume Version
                    </label>
                    <Link
                      href="/dashboard/resumes"
                      className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      Manage Versions →
                    </Link>
                  </div>
                  <select
                    value={selectedVersionId || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val) handleSelectStoredVersion(val);
                    }}
                    disabled={parsing}
                    className="w-full bg-[#09090B] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {storedVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.versionName} {v.isActive ? " (PRIMARY / ACTIVE)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl py-6 px-4 hover:border-zinc-700 transition-colors cursor-pointer bg-zinc-950/20">
                  <svg className="w-8 h-8 text-zinc-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-zinc-300 font-medium text-center">
                    {file ? file.name : "Or Upload New PDF Resume"}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1">PDF format (auto-saved as new version)</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
                <button
                  onClick={handleUpload}
                  disabled={!file || parsing}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  {parsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Parsing via LLM...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Extract & Parse
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Step 2: Search Title & Preference Setup */}
            <section className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50 group-hover:bg-blue-500 transition-colors" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-300">2</span>
                Search Parameters Configuration
              </h2>

              <div className="flex flex-col gap-5">
                {/* Location Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Target Search Location
                    </label>
                    <input
                      type="text"
                      value={locationPref}
                      onChange={(e) => setLocationPref(e.target.value)}
                      placeholder="e.g. Ahmedabad, Remote, San Francisco"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 mt-0 md:mt-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-200">Include Remote Jobs</span>
                      <span className="text-xs text-zinc-500">Includes Remote filters</span>
                    </div>
                    <button
                      onClick={() => setIsRemoteOpen(!isRemoteOpen)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isRemoteOpen ? "bg-blue-600" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isRemoteOpen ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Employment Preference */}
                <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Employment Type Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Full-time", "Part-time", "Contract", "Internship"].map((type) => {
                      const isSelected = employmentTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (employmentTypes.length > 1) {
                                setEmploymentTypes(employmentTypes.filter(t => t !== type));
                              }
                            } else {
                              setEmploymentTypes([...employmentTypes, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? "bg-blue-600/15 border-blue-500 text-blue-400"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Search Role */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Target Job Search Title
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      addLog(`Target search title set to: "${e.target.value}"`);
                    }}
                    placeholder="Enter target role (e.g. Frontend Engineer)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                  <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Suggested Roles (From Active Resume)
                      </span>
                      {profile && (
                        <button
                          onClick={() => fetchSuggestions(profile?.email)}
                          disabled={loadingSuggestions}
                          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <svg className={`w-2.5 h-2.5 ${loadingSuggestions ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                          </svg>
                          Refresh Suggestions
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setSearchTerm(suggestion);
                            addLog(`Selected suggested target search title: "${suggestion}"`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            searchTerm === suggestion
                              ? "bg-blue-600/15 border-blue-500 text-blue-400 font-semibold"
                              : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Trigger Pipeline */}
            <section className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50 group-hover:bg-blue-500 transition-colors" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-300">3</span>
                Execute Search Loop
              </h2>
              <p className="text-xs text-zinc-400 mb-6">
                Launching the workflow triggers parallel job board crawlers and API queries. Matches are evaluated via vector embeddings and delivered in real-time.
              </p>

              <button
                onClick={handleTriggerWorkflow}
                disabled={workflowRunning || !searchTerm.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {workflowRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Executing Autonomous Search...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Autonomous Job Search
                  </>
                )}
              </button>
            </section>

          </div>

          {/* Right Column - Profile Preview & Logs */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Live Terminal / Logs */}
            <section className="bg-black/60 rounded-2xl border border-zinc-850 p-6 shadow-xl flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Pipeline Activity Console
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[11px] text-zinc-400 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 flex flex-col-reverse gap-1.5">
                {logs.length === 0 ? (
                  <span className="text-zinc-600">Console idle. Select a resume version or upload a PDF to begin...</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Pipeline Architecture Timeline Visualizer */}
            <section className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 shadow-xl flex flex-col">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Pipeline Architecture Timeline
              </h3>
              <div className="flex flex-col gap-4">
                {pipelineSteps.map((step, idx) => {
                  let statusColor = "bg-zinc-850 border-zinc-800";
                  let statusDot = "bg-zinc-700";
                  let textColor = "text-zinc-500";
                  let descColor = "text-zinc-600";
                  let showSpinner = false;

                  if (step.status === "running") {
                    statusColor = "bg-yellow-950/40 border-yellow-500/50";
                    statusDot = "bg-yellow-400 animate-pulse";
                    textColor = "text-yellow-200 font-semibold";
                    descColor = "text-yellow-400/80";
                    showSpinner = true;
                  } else if (step.status === "success") {
                    statusColor = "bg-emerald-950/40 border-emerald-500/50";
                    statusDot = "bg-emerald-400";
                    textColor = "text-emerald-300 font-semibold";
                    descColor = "text-zinc-400";
                  } else if (step.status === "error") {
                    statusColor = "bg-red-950/40 border-red-500/50";
                    statusDot = "bg-red-500 animate-ping";
                    textColor = "text-red-300 font-bold";
                    descColor = "text-red-400";
                  }

                  return (
                    <div key={step.id} className="relative flex gap-4 items-start">
                      {idx < pipelineSteps.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-zinc-800" />
                      )}
                      
                      <div className={`z-10 flex items-center justify-center w-6.5 h-6.5 rounded-full border ${statusColor} bg-zinc-950 shrink-0 p-1`}>
                        {step.status === "success" ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.status === "error" ? (
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : showSpinner ? (
                          <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs ${textColor} transition-colors flex items-center justify-between`}>
                          <span>{step.name}</span>
                          {step.status === "error" && (
                            <span className="text-[10px] bg-red-950/60 border border-red-800/50 text-red-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                              Failed
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${descColor} mt-0.5 transition-colors`}>
                          {step.description}
                        </div>
                        {step.status === "error" && step.errorDetails && (
                          <div className="mt-1.5 p-2 bg-red-950/20 border border-red-900/30 rounded-lg text-[10px] font-mono text-red-400 break-all leading-normal">
                            Reason: {step.errorDetails}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Profile Info Preview */}
            <section className="bg-zinc-900/20 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 shadow-xl flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Active Profile Metadata Summary
              </h3>

              {profile ? (
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-sm text-zinc-300">
                  <div className="border-b border-zinc-850 pb-3">
                    <div className="text-xs text-zinc-500">Full Name</div>
                    <div className="font-semibold text-white">{profile.fullName || "N/A"}</div>
                    <div className="text-xs text-zinc-400 mt-1">{profile.email} • {profile.phone}</div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-500 mb-1.5">Core Technical Stack</div>
                    <div className="flex flex-wrap gap-1">
                      {profile.coreSkills?.map((skill) => (
                        <span key={skill} className="bg-zinc-850 text-zinc-300 text-xs px-2.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-500">Target Role Preference</div>
                    <div className="text-white font-medium">{profile.targetRole}</div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-500">Experience Seniority</div>
                    <div className="text-white font-medium">{profile.experienceLevel}</div>
                  </div>

                  {profile.experience?.length > 0 && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">Recent Experience</div>
                      <div className="flex flex-col gap-2.5">
                        {profile.experience.slice(0, 2).map((exp, idx) => (
                          <div key={idx} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                            <div className="font-semibold text-xs text-white">{exp.role}</div>
                            <div className="text-[11px] text-zinc-400">{exp.company} • {exp.duration}</div>
                            <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{exp.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-850 rounded-xl bg-zinc-950/10">
                  <svg className="w-12 h-12 text-zinc-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm text-zinc-500">No active profile loaded. Select a stored version or upload a PDF resume in Step 1.</span>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* Results Section */}
        <section className="mt-12 pt-12 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Job Recommendation Results
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time recommendations from vector similarity and ranking algorithms.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearHistory}
                disabled={loadingResults || workflowRunning}
                className="text-xs bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 hover:border-red-800 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History & Cache
              </button>
              <button
                onClick={() => fetchResults(profile?.email)}
                disabled={loadingResults}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${loadingResults ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                </svg>
                Refresh Results
              </button>
            </div>
          </div>

          {loadingResults ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-sm text-zinc-500">Querying database results table...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-center">
              <svg className="w-12 h-12 text-zinc-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-zinc-500 font-medium">No recommendation results found in database.</span>
              <span className="text-xs text-zinc-600 mt-1 max-w-sm">
                Run the autonomous search pipeline above to scrape listings, score them, and populate recommendations.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((item) => {
                const confScore = item.confidenceScore !== undefined && item.confidenceScore !== null ? item.confidenceScore : item.score;
                
                let factors: { positive: string[], negative: string[] } = { positive: [], negative: [] };
                if (item.confidenceFactors) {
                  try {
                    factors = typeof item.confidenceFactors === 'string' 
                      ? JSON.parse(item.confidenceFactors) 
                      : item.confidenceFactors;
                  } catch (e) {
                    console.error("Failed to parse confidence factors", e);
                  }
                }

                let fitText = "Low Match";
                let scoreColor = "bg-zinc-805/30 border-zinc-800 text-zinc-400";
                if (confScore >= 80) {
                  fitText = "Strong Match";
                  scoreColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                } else if (confScore >= 65) {
                  fitText = "Good Match";
                  scoreColor = "bg-blue-500/10 border-blue-500/30 text-blue-400";
                } else if (confScore >= 50) {
                  fitText = "Moderate Match";
                  scoreColor = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
                }

                return (
                  <div key={item.id} className="bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-850 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-lg group">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm font-semibold text-zinc-400 truncate mt-0.5">
                            {item.company}
                          </p>
                        </div>
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-extrabold font-mono flex items-center justify-center gap-1 ${scoreColor}`}>
                          <span>{fitText}</span>
                          <span className="text-[10px] opacity-70">({confScore}%)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 border-b border-zinc-850/50 pb-3 mb-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {item.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {item.reasoning && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AI Recommendation Reasoning</span>
                          <p className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 text-xs text-zinc-350 mt-1 italic leading-relaxed">
                            "{item.reasoning}"
                          </p>
                        </div>
                      )}

                      {/* Render Confidence Factors */}
                      {((factors.positive && factors.positive.length > 0) || (factors.negative && factors.negative.length > 0)) && (
                        <div className="mt-4 pt-3 border-t border-zinc-850/30">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Confidence Analysis</span>
                          <div className="mt-2 space-y-1.5">
                            {factors.positive?.map((p: string, idx: number) => (
                              <div key={`pos-${idx}`} className="flex items-start gap-1.5 text-[11px] text-emerald-400">
                                <span className="mt-0.5 select-none">✓</span>
                                <span>{p}</span>
                              </div>
                            ))}
                            {factors.negative?.map((n: string, idx: number) => (
                              <div key={`neg-${idx}`} className="flex items-start gap-1.5 text-[11px] text-yellow-500/90">
                                <span className="mt-0.5 select-none">⚠</span>
                                <span>{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-zinc-850/50 flex items-center justify-end">
                      {item.url && (item.url.startsWith("http://") || item.url.startsWith("https://")) ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          Apply on Site
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600 italic font-medium">No direct link available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
