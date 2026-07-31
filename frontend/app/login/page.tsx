"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, ArrowRight, AlertCircle, RefreshCw, KeyRound, Sparkles, TrendingUp, Cpu, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Skiper106Input } from "@/components/ui/skiper-ui/skiper106";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expiryTimer, setExpiryTimer] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // 5-minute OTP Expiry countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expiryTimer > 0) {
      interval = setInterval(() => setExpiryTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTimer]);

  // 45-second Resend OTP Cooldown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid Gmail / Email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification code.");
      }

      setStep("OTP");
      setExpiryTimer(300); // 5 minutes expiry
      setResendCooldown(45); // 45s resend cooldown
      setSuccessMsg(`Verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const token = localStorage.getItem("careeratlas_token");
        if (!token) return;

        const res = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            window.location.href = "/dashboard";
          }
        }
      } catch (err) {
        // Safe fallback
      }
    }
    checkSession();
  }, []);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid verification code.");
      }

      // Save cookie for middleware & session tracking
      document.cookie = `careeratlas_session=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      localStorage.setItem("careeratlas_token", data.token);
      localStorage.setItem("careeratlas_user", JSON.stringify(data.user));

      setSuccessMsg("Verification successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden relative">
      {/* LEFT SECTION (30% Width on Large Screens) - Login Component */}
      <div className="w-full lg:w-[32%] xl:w-[30%] min-h-screen p-6 sm:p-10 flex flex-col justify-between bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-2xl z-20 relative shadow-2xl">
        {/* Header Logo */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              CareerAtlas
            </h2>
          </div>
        </div>

        {/* Login Form Center Card */}
        <div className="my-auto py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Sign In to Your Account</h1>
            <p className="text-slate-400 text-xs mt-1.5">Enter your email to receive a secure 6-digit verification code</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-xs leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === "EMAIL" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <Skiper106Input
                  label="Gmail / Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  icon={<Mail className="w-4 h-4" />}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm">Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      6-Digit Verification Code
                    </label>
                    {expiryTimer > 0 && (
                      <span className="text-[11px] text-blue-400 font-mono">
                        Expires: {Math.floor(expiryTimer / 60)}:{(expiryTimer % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <Skiper106Input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    icon={<KeyRound className="w-4 h-4" />}
                    className="text-center tracking-[0.5em] text-lg font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading || resendCooldown > 0}
                    className="text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:hover:text-blue-400 transition-colors cursor-pointer disabled:cursor-not-allowed font-medium"
                  >
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SECTION (70% Width on Large Screens) - Relatable Hero Graphic & Animation */}
      <div className="hidden lg:flex lg:w-[68%] xl:w-[70%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background Image Container with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/career_login_hero.jpg"
            alt="Career Intelligence Platform"
            className="w-full h-full object-cover opacity-35 filter contrast-125 saturate-110 scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 z-10" />
        </div>

        {/* Glowing Ambient Particles */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-10" />

        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-20 self-end flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">Autonomous Job-Career Engine</span>
        </motion.div>

        {/* Center Animated Overlay Content */}
        <div className="relative z-20 max-w-2xl my-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Job finding just got easier</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Land Your Next High-Impact Role with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">AI Precision</span>.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              CareerAtlas continuously scans ATS job portals, extracts skill requirements, and matches your profile against vector space embeddings in real-time.
            </p>
          </motion.div>

          {/* Interactive Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl rounded-2xl space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 text-blue-400">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-100">99.4% Semantic Precision</span>
              </div>
              <p className="text-xs text-slate-400">Qdrant vector embeddings eliminate noisy job boards and deliver true candidate-job alignment.</p>
            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl rounded-2xl space-y-2 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-100">Anti-Detect Scraping</span>
              </div>
              <p className="text-xs text-slate-400">Camoufox shared browser pooling parses JSON-LD schemas with zero latency impact.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
