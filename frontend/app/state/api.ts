import { getUserEmail, getAuthHeaders } from "@/app/utils/auth";
import type { Filters, Job, JobDraft, JobPhase } from "./jobs";

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const JSON_HEADERS: Record<string, string> = { "Content-Type": "application/json" };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers = isFormData
    ? { ...getAuthHeaders(), ...init?.headers }
    : { ...JSON_HEADERS, ...getAuthHeaders(), ...init?.headers };
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function emailParam(): string {
  const email = getUserEmail();
  return email ? `?email=${encodeURIComponent(email)}` : "";
}

function queryString(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.phase !== "all") params.set("phase", filters.phase);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.company) params.set("company", filters.company);
  if (filters.bookmarkedOnly) params.set("bookmarked", "true");
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  return params.toString();
}

export async function fetchJobs(filters: Filters): Promise<Job[]> {
  const qs = queryString(filters);
  return request<Job[]>(`/api/jobs${qs ? `?${qs}` : ""}`);
}

export function createJob(draft: JobDraft): Promise<Job> {
  return request<Job>(`/api/jobs${emailParam()}`, { method: "POST", body: JSON.stringify(draft) });
}

export function updateJob(id: number, patch: Partial<Job>): Promise<Job> {
  return request<Job>(`/api/jobs/${id}${emailParam()}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function deleteJob(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/jobs/${id}${emailParam()}`, { method: "DELETE" });
}

export function moveJob(id: number, phase: JobPhase, sortOrder: number): Promise<Job> {
  return request<Job>(`/api/jobs/${id}/move${emailParam()}`, { method: "POST", body: JSON.stringify({ phase, sortOrder }) });
}

export function reorderJobs(items: { id: number; phase: JobPhase; sortOrder: number }[]): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/jobs/reorder${emailParam()}`, { method: "POST", body: JSON.stringify({ items }) });
}

export async function exportJobs(format: "json" | "csv"): Promise<void> {
  const email = getUserEmail();
  const url = `/api/jobs/export?format=${format}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = format === "csv" ? "jobs.csv" : "jobs.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function importJobsJson(jobs: JobDraft[]): Promise<ImportResult> {
  return request<ImportResult>(`/api/jobs/import${emailParam()}`, { method: "POST", body: JSON.stringify({ jobs }) });
}

export async function importJobsCsv(file: File, mapping: Record<string, string>): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  return request<ImportResult>(`/api/jobs/import${emailParam()}`, { method: "POST", body: formData });
}
