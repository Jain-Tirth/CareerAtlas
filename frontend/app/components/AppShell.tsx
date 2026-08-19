"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Kanban, History, LogOut, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleHistory = () => {
    setHistoryOpen((o) => !o);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#664930] font-sans flex flex-col md:flex-row overflow-x-hidden">
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FFFBF7]/95 backdrop-blur-md border-b border-[#CCBEB1] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <CareerAtlasLogoMark size={28} showText />
        </Link>

        <div className="flex items-center gap-2">
          {history && (
            <button
              onClick={toggleHistory}
              aria-label="Recent Scans History"
              className="p-2 rounded-xl border border-[#CCBEB1] bg-white text-[#997E67] hover:text-[#664930] active:bg-[#FFDBBB] transition-colors"
            >
              <History className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Drawer"
            className="p-2 rounded-xl border border-[#CCBEB1] bg-white text-[#664930] hover:bg-[#FFDBBB]/40 active:scale-95 transition-all flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-[#664930]" />
          </button>
        </div>
      </header>

      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex md:w-64 md:sticky md:top-0 md:h-screen shrink-0 bg-[#FFFBF7] border-r border-[#CCBEB1] p-5 flex-col justify-between">
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

        <div className="pt-4 border-t border-[#CCBEB1]/60">
          <button
            onClick={() => void logout()}
            className="w-full flex items-center gap-2.5 text-xs font-bold text-[#664930] hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 text-[#997E67] group-hover:text-red-700 transition-colors" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Dedicated Mobile Slide-Over Drawer Sheet */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 z-[80] bg-[#664930]/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Mobile Menu Sheet */}
          <aside className="fixed inset-y-0 left-0 z-[90] w-80 max-w-[85vw] bg-[#FFFBF7] border-r border-[#CCBEB1] p-5 flex flex-col justify-between shadow-2xl md:hidden animate-in slide-in-from-left duration-300 font-sans">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#CCBEB1]/60">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <CareerAtlasLogoMark size={30} showText />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close Mobile Menu"
                  className="p-2 rounded-xl border border-[#CCBEB1] bg-white text-[#997E67] hover:text-[#664930] active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href || pathname === `${link.href}/`;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 text-sm font-extrabold px-3.5 py-3 rounded-xl border transition-all ${
                        active
                          ? "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930]"
                          : "bg-white border-[#CCBEB1] text-[#997E67] hover:border-[#664930] hover:text-[#664930]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-[#664930]" : "text-[#997E67]"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                {history && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      toggleHistory();
                    }}
                    className={`w-full flex items-center gap-3 text-sm font-extrabold px-3.5 py-3 rounded-xl border transition-all ${
                      historyOpen
                        ? "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930]"
                        : "bg-white border-[#CCBEB1] text-[#997E67] hover:border-[#664930] hover:text-[#664930]"
                    }`}
                  >
                    <History className="w-5 h-5 text-[#997E67]" />
                    <span>Recent Scans History</span>
                  </button>
                )}
              </nav>

              {workspaceSidebar && (
                <div className="pt-4 border-t border-[#CCBEB1]/60">
                  {workspaceSidebar}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#CCBEB1]/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  void logout();
                }}
                className="w-full flex items-center gap-3 text-sm font-extrabold text-[#664930] hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all border border-[#CCBEB1]/40 bg-white"
              >
                <LogOut className="w-5 h-5 text-[#997E67]" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content View */}
      <main className="flex-1 min-w-0">
        <div className={historyOpen ? "blur-md transition-[filter] duration-300" : "transition-[filter] duration-300"}>
          {children}
        </div>
      </main>

      {/* Recent Scans History Popover */}
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-[#664930]/20 backdrop-blur-xs"
            onClick={() => setHistoryOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={popoverRef}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#CCBEB1] bg-white shadow-2xl font-sans p-1"
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
