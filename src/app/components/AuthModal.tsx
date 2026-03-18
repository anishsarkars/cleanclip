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
    // Backend naming can vary; we support common options via fallback below.
    return mode === "login" ? "/auth/login" : "/auth/signup";
  }, [mode]);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Log in to sync your credits across devices."
      : "Sign up to get more credits and remove watermarks.";

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const tryEndpoints = [endpoint];
      // Common alternates (some backends use /register or /sign-up etc.)
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      id="auth-modal"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
        }}
      >
        <button
          id="auth-close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#f3f4f6",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            background: "#111827",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 0 18px",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 22px" }}>
          {subtitle}
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button
            onClick={() => setMode("login")}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 12,
              border: mode === "login" ? "1px solid #111827" : "1px solid #e5e7eb",
              background: mode === "login" ? "#111827" : "#fff",
              color: mode === "login" ? "#fff" : "#111827",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 12,
              border: mode === "signup" ? "1px solid #111827" : "1px solid #e5e7eb",
              background: mode === "signup" ? "#111827" : "#fff",
              color: mode === "signup" ? "#fff" : "#111827",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign up
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>Email</span>
            <input
              id="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#111827")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>Password</span>
            <input
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#111827")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </label>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: 14,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.4,
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            id="auth-submit-btn"
            onClick={submit}
            disabled={submitting || !email || !password}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "12px 16px",
              borderRadius: 16,
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: submitting ? "wait" : "pointer",
              fontWeight: 800,
              fontSize: 14,
              fontFamily: "inherit",
              opacity: submitting || !email || !password ? 0.7 : 1,
            }}
          >
            {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>

          <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0", lineHeight: 1.5 }}>
            By continuing, you agree to store a login token in your browser for a smoother experience.
          </p>
        </div>
      </div>
    </div>
  );
}

