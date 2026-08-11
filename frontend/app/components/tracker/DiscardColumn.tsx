"use client";

import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

export function DiscardColumn() {
  const { setNodeRef, isOver } = useDroppable({ id: "column:discarded" });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-72 max-w-96 rounded-2xl border-2 border-dashed p-3 flex flex-col items-center justify-center gap-2 min-h-40 transition-colors ${
        isOver ? "border-red-600 bg-red-100/60" : "border-[#CCBEB1] bg-[#FFFBF7]"
      }`}
    >
      <Trash2 className={`w-6 h-6 ${isOver ? "text-red-600" : "text-[#997E67]"}`} />
      <span className="text-xs font-extrabold uppercase tracking-wider text-[#664930]">Discard</span>
      <p className="text-[11px] text-[#997E67] text-center">Drop a job here to remove it from the tracker</p>
    </div>
  );
}
