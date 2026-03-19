"use client";

import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AuthMode = "login" | "signup";

export interface AuthSuccessPayload {
  token: string;
  user_id: string;
  email: string;
  plan: string;
  credits: number;
}

interface AuthModalProps {
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: (data: AuthSuccessPayload) => void;
}

export default function AuthModal({ initialMode, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMode(initialMode), [initialMode]);

  const endpoint = useMemo(() => {
    return mode === "login" ? "/auth/login" : "/auth/signup";
  }, [mode]);

  const title = mode === "login" ? "Welcome back" : "Create account";
  const subtitle =
    mode === "login"
      ? "Log in to access your dashboard and credits."
      : "Join thousands of creators using AI for video.";

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const tryEndpoints = [endpoint];
      if (mode === "signup") tryEndpoints.push("/auth/register", "/auth/sign-up");
      if (mode === "login") tryEndpoints.push("/auth/signin", "/auth/sign-in");

      let lastErr: unknown = null;
      for (const ep of tryEndpoints) {
        try {
          const res = await fetch(`${API}${ep}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            lastErr = new Error(data?.detail || data?.message || "Authentication failed");
            continue;
          }

          const payload: AuthSuccessPayload = {
            token: data.token ?? data.access_token ?? "",
            user_id: data.user_id ?? data.id ?? "",
            email: data.email ?? email,
            plan: data.plan ?? "none",
            credits: data.credits ?? 0,
          };
          if (!payload.token || !payload.user_id) {
            throw new Error("Unexpected auth response from server.");
          }

          localStorage.setItem("cleanclip_token", payload.token);
          onSuccess(payload);
          return;
        } catch (e) {
          lastErr = e;
        }
      }

      const msg =
        lastErr instanceof Error ? lastErr.message : "Authentication failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-[40px] p-8 md:p-12 max-w-md w-full shadow-2xl border border-white/20 animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400 group-hover:text-gray-900 transition-colors">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="w-16 h-16 bg-gray-900 rounded-[22px] flex items-center justify-center mb-8 shadow-xl shadow-gray-200">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8">
          {subtitle}
        </p>

        <div className="flex bg-gray-50 p-1.5 rounded-[22px] mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${
              mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${
              mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-gray-900 outline-none transition-all text-sm font-bold bg-gray-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-gray-900 outline-none transition-all text-sm font-bold bg-gray-50/50"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-bold animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !email || !password}
            className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {submitting ? (
               <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
               mode === "login" ? "Welcome Back" : "Start Creating"
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
            By continuing, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}


