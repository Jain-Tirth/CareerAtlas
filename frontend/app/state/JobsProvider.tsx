"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  createPendingMutation, createTempJob, enqueueMutation, initialJobsState, jobsReducer,
  nextSortOrder, persistQueue, selectFilteredJobs,
  type Filters, type Job, type JobDraft, type JobPhase, type PendingMutation,
} from "./jobs";
import {
  createJob, deleteJob, exportJobs, fetchJobs, importJobsCsv, importJobsJson, moveJob,
  reorderJobs, updateJob, type ImportResult,
} from "./api";

export interface JobsApi {
  jobs: Job[];
  filteredJobs: Job[];
  filters: Filters;
  view: "board" | "list";
  syncStatus: "synced" | "syncing" | "offline" | "error";
  queue: PendingMutation[];
  addJob: (draft: JobDraft) => Promise<void>;
  updateJob: (id: number, patch: Partial<Job>) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
  moveJob: (id: number, phase: JobPhase, sortOrder: number) => Promise<void>;
  reorder: (items: { id: number; phase: JobPhase; sortOrder: number }[]) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  setView: (view: "board" | "list") => void;
  refresh: () => Promise<void>;
  importJson: (jobs: JobDraft[]) => Promise<ImportResult>;
  importCsv: (file: File, mapping: Record<string, string>) => Promise<ImportResult>;
  exportData: (format: "json" | "csv") => Promise<void>;
}

const JobsContext = createContext<JobsApi | null>(null);

const isNetworkError = (e: unknown) => e instanceof TypeError || (e instanceof Error && e.message.includes("fetch"));

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(jobsReducer, undefined, initialJobsState);
  const queueRef = useRef(state.queue);
  queueRef.current = state.queue;

  const goOffline = (queue: PendingMutation[]) => {
    dispatch({ type: "QUEUE_SET", queue });
    persistQueue(queue);
    dispatch({ type: "SET_SYNC_STATUS", status: "offline" });
  };

  const refresh = async () => {
    try {
      const jobs = await fetchJobs(state.filters);
      dispatch({ type: "HYDRATE", jobs });
    } catch {}
  };

  const flushQueue = async () => {
    const queue = queueRef.current;
    if (queue.length === 0) return;
    const remaining: PendingMutation[] = [];
    let failed = false;
    for (const mutation of queue) {
      try {
        if (mutation.kind === "create") await createJob(mutation.payload);
        else if (mutation.kind === "update") await updateJob(mutation.jobId, mutation.patch);
        else if (mutation.kind === "delete") await deleteJob(mutation.jobId);
        else if (mutation.kind === "move") await moveJob(mutation.jobId, mutation.phase, mutation.sortOrder);
      } catch (e) {
        failed = true;
        if (isNetworkError(e)) remaining.push(mutation);
      }
    }
    dispatch({ type: "QUEUE_SET", queue: remaining });
    persistQueue(remaining);
    if (!failed) {
      dispatch({ type: "SET_SYNC_STATUS", status: "synced" });
      await refresh();
    }
  };

  useEffect(() => {
    void refresh();
    const onOnline = () => {
      dispatch({ type: "SET_SYNC_STATUS", status: "syncing" });
      void flushQueue();
    };
    const onOffline = () => {
      dispatch({ type: "SET_SYNC_STATUS", status: "offline" });
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const api = useMemo<JobsApi>(() => {
    const handleFailure = (e: unknown, rollback: () => void, queued: PendingMutation | null) => {
      if (isNetworkError(e)) {
        if (queued) goOffline(enqueueMutation(state.queue, queued));
        else dispatch({ type: "SET_SYNC_STATUS", status: "offline" });
      } else {
        rollback();
      }
    };

    return {
      jobs: state.jobs,
      filteredJobs: selectFilteredJobs(state.jobs, state.filters),
      filters: state.filters,
      view: state.view,
      syncStatus: state.syncStatus,
      queue: state.queue,

      addJob: async (draft) => {
        const temp = createTempJob(draft, nextSortOrder(state.jobs, draft.phase ?? "bookmarked"));
        dispatch({ type: "OPTIMISTIC_CREATE", temp });
        try {
          const created = await createJob(draft);
          dispatch({ type: "CREATE_CONFIRMED", tempId: temp.id, job: created });
        } catch (e) {
          const queued = enqueueMutation(state.queue, createPendingMutation("create", { payload: draft }));
          if (isNetworkError(e)) {
            goOffline(queued);
          } else {
            dispatch({ type: "QUEUE_SET", queue: queued });
            persistQueue(queued);
            dispatch({ type: "SET_SYNC_STATUS", status: "error" });
          }
        }
      },

      updateJob: async (id, patch) => {
        const snapshot = state.jobs.find((j) => j.id === id);
        if (!snapshot) return;
        dispatch({ type: "PATCH", jobId: id, patch });
        try {
          await updateJob(id, patch);
        } catch (e) {
          handleFailure(e, () => dispatch({ type: "PATCH", jobId: id, patch: snapshot }), createPendingMutation("update", { jobId: id, patch }));
        }
      },

      deleteJob: async (id) => {
        const snapshot = state.jobs.find((j) => j.id === id);
        if (!snapshot) return;
        dispatch({ type: "DELETE", jobId: id });
        try {
          await deleteJob(id);
        } catch (e) {
          handleFailure(e, () => dispatch({ type: "RESTORE", job: snapshot }), createPendingMutation("delete", { jobId: id }));
        }
      },

      moveJob: async (id, phase, sortOrder) => {
        const snapshot = state.jobs.find((j) => j.id === id);
        if (!snapshot) return;
        dispatch({ type: "MOVE", jobId: id, phase, sortOrder });
        try {
          await moveJob(id, phase, sortOrder);
        } catch (e) {
          handleFailure(e, () => dispatch({ type: "PATCH", jobId: id, patch: snapshot }), createPendingMutation("move", { jobId: id, phase, sortOrder }));
        }
      },

      reorder: async (items) => {
        try {
          await reorderJobs(items);
        } catch (e) {
          if (!isNetworkError(e)) throw e;
        }
      },

      setFilters: (filters) => dispatch({ type: "SET_FILTERS", filters }),
      setView: (view) => dispatch({ type: "SET_VIEW", view }),
      refresh,
      importJson: (jobs) => importJobsJson(jobs),
      importCsv: (file, mapping) => importJobsCsv(file, mapping),
      exportData: (format) => exportJobs(format),
    };
  }, [state]);

  return <JobsContext.Provider value={api}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsApi {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within a JobsProvider");
  return ctx;
}
