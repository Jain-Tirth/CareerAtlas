"use client";

import { useMemo, useState } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { JOB_PHASES, type Job, type JobPhase } from "@/app/state/jobs";
import { useJobs } from "@/app/state/JobsProvider";
import { DiscardColumn } from "./DiscardColumn";
import { JobCard } from "./JobCard";
import { PhaseColumn } from "./PhaseColumn";

interface BoardViewProps {
  onOpen: (job: Job) => void;
  onAdd: (phase: JobPhase) => void;
}

function resolveDrop(activeJob: Job, overId: string | number, jobs: Job[]): { phase: JobPhase; sortOrder: number } {
  if (typeof overId === "string" && overId.startsWith("column:")) {
    const phase = overId.slice(7) as JobPhase;
    const max = jobs.filter((j) => j.phase === phase).reduce((m, j) => Math.max(m, j.sortOrder + 1), 0);
    return { phase, sortOrder: max };
  }
  const overJob = jobs.find((j) => j.id === Number(overId));
  if (!overJob) return { phase: activeJob.phase, sortOrder: activeJob.sortOrder };
  if (activeJob.phase === overJob.phase) {
    const inPhase = jobs
      .filter((j) => j.phase === overJob.phase)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const fromIndex = inPhase.findIndex((j) => j.id === activeJob.id);
    const toIndex = inPhase.findIndex((j) => j.id === overJob.id);
    const list = [...inPhase];
    if (fromIndex >= 0) list.splice(fromIndex, 1);
    const target = toIndex >= 0 ? Math.min(toIndex, list.length) : list.length;
    list.splice(target, 0, activeJob);
    return { phase: overJob.phase, sortOrder: list.findIndex((j) => j.id === activeJob.id) };
  }
  const targetList = jobs
    .filter((j) => j.phase === overJob.phase)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const targetIndex = targetList.findIndex((j) => j.id === overJob.id);
  const before = targetIndex <= 0 ? [] : targetList.slice(0, targetIndex);
  const atOrAfter = targetList.slice(targetIndex);
  const merged = [...before, activeJob, ...atOrAfter];
  const order = merged.map((j) => (j.id === activeJob.id ? { id: j.id, sortOrder: merged.indexOf(j) } : { id: j.id, sortOrder: j.sortOrder }));
  const chosen = order.find((o) => o.id === activeJob.id);
  return { phase: overJob.phase, sortOrder: chosen?.sortOrder ?? targetIndex };
}

export function BoardView({ onOpen, onAdd }: BoardViewProps) {
  const { jobs, moveJob, deleteJob, reorder } = useJobs();
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byPhase = useMemo(() => {
    const map = new Map<JobPhase, Job[]>();
    for (const phase of JOB_PHASES) map.set(phase, jobs.filter((j) => j.phase === phase).sort((a, b) => a.sortOrder - b.sortOrder));
    return map;
  }, [jobs]);

  const activeJob = activeId !== null ? jobs.find((j) => j.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as number);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const sourceJob = jobs.find((j) => j.id === active.id);
    if (!sourceJob) return;
    if (typeof over.id === "string" && over.id === "column:discarded") {
      void deleteJob(sourceJob.id);
      return;
    }
    const target = resolveDrop(sourceJob, over.id, jobs);
    if (target.phase === sourceJob.phase && target.sortOrder === sourceJob.sortOrder) return;
    const affected = new Map<string, { id: number; phase: JobPhase; sortOrder: number }>();
    const sourceList = byPhase.get(sourceJob.phase) ?? [];
    const targetList = byPhase.get(target.phase) ?? [];
    if (sourceJob.phase === target.phase) {
      const list = sourceList.filter((j) => j.id !== sourceJob.id);
      const reinsert = [...list.slice(0, target.sortOrder), sourceJob, ...list.slice(target.sortOrder)];
      reinsert.forEach((j, idx) => {
        if (j.sortOrder !== idx || j.phase !== sourceJob.phase) affected.set(`${j.id}`, { id: j.id, phase: sourceJob.phase, sortOrder: idx });
      });
    } else {
      const sourceRemaining = sourceList.filter((j) => j.id !== sourceJob.id);
      const targetInserted = [...targetList.filter((j) => j.sortOrder < target.sortOrder), sourceJob, ...targetList.filter((j) => j.sortOrder >= target.sortOrder)];
      sourceRemaining.forEach((j, idx) => { if (j.sortOrder !== idx) affected.set(`${j.id}`, { id: j.id, phase: sourceJob.phase, sortOrder: idx }); });
      targetInserted.forEach((j, idx) => {
        const expected = { id: j.id, phase: target.phase, sortOrder: idx };
        if (j.id === sourceJob.id) { affected.set(`${j.id}`, expected); return; }
        if (j.phase !== target.phase || j.sortOrder !== idx) affected.set(`${j.id}`, expected);
      });
    }
    moveJob(sourceJob.id, target.phase, target.sortOrder);
    const items = [...affected.values()];
    if (items.length > 1) void reorder(items);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className="flex flex-1 min-h-0 gap-4 items-stretch overflow-x-auto pb-4">
        {JOB_PHASES.map((phase) => (
          <PhaseColumn key={phase} phase={phase} jobs={byPhase.get(phase) ?? []} onOpen={onOpen} onAdd={onAdd} />
        ))}
        <DiscardColumn />
      </div>
      <DragOverlay>{activeJob ? <div className="opacity-90"><JobCard job={activeJob} onOpen={() => {}} /></div> : null}</DragOverlay>
    </DndContext>
  );
}
