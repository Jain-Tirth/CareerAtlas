"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Kanban, History, LogOut } from "lucide-react";
import { CareerAtlasLogoMark } from "@/components/ui/CareerAtlasLogoMark";
import { logout } from "@/app/utils/auth";
import type { SearchSession } from "@/app/components/agent/AgentWorkspaceSidebar";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "Resume Vault", icon: FileText },
  { href: "/tracker", label: "Job Tracker", icon: Kanban },
];

interface HistoryProps {
  sessions: SearchSession[];
  onSelect: (sessionId: string) => void;
}

export function AppShell({
  children,
  workspaceSidebar,
  history,
}: {
  children: React.ReactNode;
  workspaceSidebar?: React.ReactNode;
  history?: HistoryProps;
}) {
  const pathname = usePathname();
  const historyRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!historyOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || historyRef.current?.contains(target)) return;
      setHistoryOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHistoryOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [historyOpen]);

  const toggleHistory = () => {
    setHistoryOpen((o) => !o);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#664930] font-sans flex">
      <aside className="w-64 shrink-0 bg-[#FFFBF7] border-r border-[#CCBEB1] p-5 flex flex-col justify-between sticky top-0 h-screen">
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]/60">
            <Link href="/" className="flex items-center gap-2.5 group">
              <CareerAtlasLogoMark size={32} showText />
            </Link>
          </div>
          <nav className="space-y-1.5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname === `${link.href}/`;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${
                    active
                      ? "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930]"
                      : "bg-white border-[#CCBEB1] text-[#997E67] hover:border-[#664930] hover:text-[#664930]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#664930]" : "text-[#997E67]"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {history && (
              <button
                ref={historyRef}
                onClick={toggleHistory}
                className={`w-full flex items-center gap-2.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${
                  historyOpen
                    ? "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930]"
                    : "bg-white border-[#CCBEB1] text-[#997E67] hover:border-[#664930] hover:text-[#664930]"
                }`}
              >
                <History className="w-4 h-4 text-[#997E67]" />
                <span>History</span>
              </button>
            )}
          </nav>
          {workspaceSidebar && (
            <div className="pt-4 border-t border-[#CCBEB1]/60">{workspaceSidebar}</div>
          )}
        </div>
        <button
          onClick={() => void logout()}
          className="w-full flex items-center gap-2.5 text-xs font-bold text-[#664930] hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4 text-[#997E67] group-hover:text-red-700 transition-colors" />
          <span>Log out</span>
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <div className={historyOpen ? "blur-md transition-[filter] duration-300" : "transition-[filter] duration-300"}>{children}</div>
      </main>
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-[#664930]/15 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={popoverRef}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#CCBEB1] bg-white shadow-xl font-sans"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#CCBEB1]/60">
              <History className="w-4 h-4 text-[#664930]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#664930]">Recent Scans</span>
            </div>
            {history && history.sessions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-extrabold text-[#664930]">No scans found</p>
                <p className="text-[11px] text-[#997E67] mt-1">Run your first systematic pipeline search and it will appear here.</p>
              </div>
            ) : (
              <ul className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {history?.sessions.map((sess) => (
                  <li key={sess.id}>
                    <button
                      onClick={() => {
                        setHistoryOpen(false);
                        history?.onSelect(sess.id);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#FFDBBB]/40 transition-all flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#664930] truncate block">{sess.title}</span>
                        <span className="text-[10px] text-[#997E67] block mt-0.5">
                          Found {sess.jobCount} Jobs • {sess.timestamp}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#997E67] group-hover:text-[#664930] shrink-0">Open →</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
