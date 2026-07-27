"use client";

export function getUserEmail(): string {
  if (typeof window === "undefined") return "";
  const userStr = localStorage.getItem("careeratlas_user");
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      if (parsed && parsed.email) return parsed.email;
    } catch {}
  }
  return localStorage.getItem("user_email") || "";
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("careeratlas_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
