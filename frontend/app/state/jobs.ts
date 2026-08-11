export const JOB_PHASES = ["bookmarked", "applied", "interviewing", "accepted", "rejected"] as const;
export type JobPhase = (typeof JOB_PHASES)[number];

export const PHASE_LABELS: Record<JobPhase, string> = {
  bookmarked: "Bookmarked",
  applied: "Applied",
  interviewing: "Interviewing",
  accepted: "Accepted",
  rejected: "Rejected",
};

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  url: string | null;
  notes: string | null;
  tags: string[];
  phase: JobPhase;
  sortOrder: number;
  bookmarked: boolean;
  source: string;
  companyLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastMovedAt: string | null;
}

export type JobDraft = Partial<
  Pick<Job, "title" | "company" | "location" | "salaryMin" | "salaryMax" | "url" | "notes" | "tags" | "phase" | "bookmarked" | "companyLogoUrl">
>;

export interface Filters {
  q: string;
  phase: JobPhase | "all";
  tag: string | null;
  company: string | null;
  bookmarkedOnly: boolean;
  from: string | null;
  to: string | null;
}

export type PendingMutation =
  | { id: string; kind: "create"; payload: JobDraft; createdAt: number }
  | { id: string; kind: "update"; jobId: number; patch: Partial<Job>; createdAt: number }
  | { id: string; kind: "delete"; jobId: number; createdAt: number }
  | { id: string; kind: "move"; jobId: number; phase: JobPhase; sortOrder: number; createdAt: number };

export interface JobsState {
  jobs: Job[];
  filters: Filters;
  view: "board" | "list";
  syncStatus: "synced" | "syncing" | "offline" | "error";
  queue: PendingMutation[];
}

export type JobsAction =
  | { type: "HYDRATE"; jobs: Job[] }
  | { type: "OPTIMISTIC_CREATE"; temp: Job }
  | { type: "CREATE_CONFIRMED"; tempId: number; job: Job }
  | { type: "PATCH"; jobId: number; patch: Partial<Job> }
  | { type: "MOVE"; jobId: number; phase: JobPhase; sortOrder: number }
  | { type: "DELETE"; jobId: number }
  | { type: "RESTORE"; job: Job }
  | { type: "QUEUE_SET"; queue: PendingMutation[] }
  | { type: "SET_SYNC_STATUS"; status: JobsState["syncStatus"] }
  | { type: "SET_FILTERS"; filters: Partial<Filters> }
  | { type: "SET_VIEW"; view: "board" | "list" };

export function nextSortOrder(jobs: Job[], phase: JobPhase): number {
  const inPhase = jobs.filter((j) => j.phase === phase);
  return inPhase.reduce((max, j) => Math.max(max, j.sortOrder + 1), 0);
}

export function createTempJob(draft: JobDraft, sortOrder: number): Job {
  const now = new Date().toISOString();
  return {
    id: -Date.now(),
    title: draft.title ?? "",
    company: draft.company ?? "",
    location: draft.location ?? null,
    salaryMin: draft.salaryMin ?? null,
    salaryMax: draft.salaryMax ?? null,
    url: draft.url ?? null,
    notes: draft.notes ?? null,
    tags: draft.tags ?? [],
    phase: draft.phase ?? "bookmarked",
    sortOrder,
    bookmarked: draft.bookmarked ?? false,
    source: "manual",
    companyLogoUrl: draft.companyLogoUrl ?? null,
    createdAt: now,
    updatedAt: now,
    lastMovedAt: null,
  };
}

export function createPendingMutation(
  kind: PendingMutation["kind"],
  data: Omit<Extract<PendingMutation, { kind: typeof kind }>, "kind" | "id" | "createdAt">,
): PendingMutation {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return { id, kind, ...(data as any), createdAt: Date.now() } as PendingMutation;
}

export function enqueueMutation(queue: PendingMutation[], mutation: PendingMutation): PendingMutation[] {
  return [...queue, mutation];
}

const QUEUE_KEY = "careeratlas_jt_queue";

export function persistQueue(queue: PendingMutation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function loadQueue(): PendingMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function selectFilteredJobs(jobs: Job[], filters: Filters): Job[] {
  const q = filters.q.trim().toLowerCase();
  return jobs.filter((j) => {
    if (filters.phase !== "all" && j.phase !== filters.phase) return false;
    if (filters.bookmarkedOnly && !j.bookmarked) return false;
    if (filters.tag && !j.tags.includes(filters.tag)) return false;
    if (filters.company && j.company.toLowerCase() !== filters.company.toLowerCase()) return false;
    if (filters.from && new Date(j.createdAt) < new Date(filters.from)) return false;
    if (filters.to && new Date(j.createdAt) > new Date(filters.to)) return false;
    if (q) {
      const hay = `${j.title} ${j.company} ${j.location ?? ""} ${j.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const EMPTY_FILTERS: Filters = {
  q: "", phase: "all", tag: null, company: null, bookmarkedOnly: false, from: null, to: null,
};

export function initialJobsState(): JobsState {
  return { jobs: [], filters: EMPTY_FILTERS, view: "board", syncStatus: "synced", queue: loadQueue() };
}

export function jobsReducer(state: JobsState, action: JobsAction): JobsState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, jobs: action.jobs, syncStatus: "synced" };
    case "OPTIMISTIC_CREATE":
      return { ...state, jobs: [...state.jobs, action.temp] };
    case "CREATE_CONFIRMED": {
      if (state.jobs.some((j) => j.id === action.job.id)) return state;
      const hasTemp = state.jobs.some((j) => j.id === action.tempId);
      return {
        ...state,
        jobs: hasTemp
          ? state.jobs.map((j) => (j.id === action.tempId ? action.job : j))
          : [...state.jobs, action.job],
      };
    }
    case "PATCH":
      return { ...state, jobs: state.jobs.map((j) => (j.id === action.jobId ? { ...j, ...action.patch } : j)) };
    case "MOVE":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId ? { ...j, phase: action.phase, sortOrder: action.sortOrder, lastMovedAt: new Date().toISOString() } : j,
        ),
      };
    case "DELETE":
      return { ...state, jobs: state.jobs.filter((j) => j.id !== action.jobId) };
    case "RESTORE":
      return state.jobs.some((j) => j.id === action.job.id) ? state : { ...state, jobs: [...state.jobs, action.job] };
    case "QUEUE_SET":
      return { ...state, queue: action.queue };
    case "SET_SYNC_STATUS":
      return { ...state, syncStatus: action.status };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "SET_VIEW":
      return { ...state, view: action.view };
  }
}
