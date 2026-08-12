"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-[#664930]/35 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md bg-white border border-[#CCBEB1] rounded-2xl p-6 shadow-2xl font-sans text-[#664930]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isDanger
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-[#FFDBBB] border-[#CCBEB1] text-[#664930]"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#664930] font-sans">{title}</h3>
                  <span className="text-xs text-[#997E67] font-mono">Confirmation Action</span>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-[#997E67] hover:text-[#664930] p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#997E67] leading-relaxed mb-6 font-sans font-medium">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3 font-sans">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-[#664930] bg-[#FFFBF7] hover:bg-[#FFDBBB]/50 border border-[#CCBEB1] rounded-xl transition-all font-sans"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 font-sans ${
                  isDanger
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                    : "bg-[#664930] hover:bg-[#523a26] shadow-[#664930]/20"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
