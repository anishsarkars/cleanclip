"use client";

import { useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OnboardingModalProps {
  token: string;
  onPaymentStart: (plan: string) => void;
  onSuccess: (plan: string, credits: number) => void;
}

export default function OnboardingModal({ token, onPaymentStart, onSuccess }: OnboardingModalProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = useMemo(
    () => [
      {
        id: "free",
        name: "Free",
        desc: "15 videos/month",
        price: "₹0",
        meta: "480p · Watermark",
        primary: false,
      },
      {
        id: "monthly",
        name: "Monthly",
        desc: "50 videos/month",
        price: "₹199",
        meta: "720p HD · No watermark",
        primary: true,
      },
      {
        id: "yearly",
        name: "Yearly",
        desc: "50 videos/month discounted",
        price: "₹1,499",
        meta: "Best value · No watermark",
        primary: false,
      },
    ],
    []
  );

  const selectFree = async () => {
    setError(null);
    setBusy("free");
    try {
      const res = await fetch(`${API}/auth/select-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: "free" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || data?.message || "Could not activate Free plan");

      const plan = data.plan ?? "free";
      const credits = data.credits ?? data.remaining_credits ?? 15;
      onSuccess(plan, credits);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not activate Free plan";
      // Keep the UI usable even if backend doesn’t support free plan selection.
      setError(`${msg}. You can still choose a paid plan or continue and upgrade later.`);
      onSuccess("free", 15);
    } finally {
      setBusy(null);
    }
  };

  const startPaid = async (planId: "monthly" | "yearly") => {
    setError(null);
    setBusy(planId);
    try {
      await onPaymentStart(planId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start payment";
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      id="onboarding-modal"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          maxWidth: 760,
          width: "100%",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 10px" }}>
              One last step
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
              Pick a plan to continue
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
              You can upgrade anytime. Credits are tracked per account.
            </p>
          </div>

          <div style={{ width: 56, height: 56, background: "#111827", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7l3-7z" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
          }}
        >
          {plans.map((p) => {
            const disabled = busy !== null;
            const isBusy = busy === p.id;
            const isFree = p.id === "free";

            const onClick = () => {
              if (disabled) return;
              if (isFree) selectFree();
              else startPaid(p.id as "monthly" | "yearly");
            };

            return (
              <button
                key={p.id}
                onClick={onClick}
                disabled={disabled}
                style={{
                  textAlign: "left",
                  borderRadius: 18,
                  border: "1px solid",
                  borderColor: p.primary ? "#111827" : "#e5e7eb",
                  background: p.primary ? "#111827" : "#fff",
                  color: p.primary ? "#fff" : "#111827",
                  padding: 18,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: disabled && !isBusy ? 0.6 : 1,
                  transition: "transform 0.1s ease",
                }}
                onMouseDown={(e) => {
                  if (!disabled) e.currentTarget.style.transform = "scale(0.99)";
                }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{p.price}</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: p.primary ? 0.9 : 1, color: p.primary ? "rgba(255,255,255,0.75)" : "#6b7280" }}>
                  {p.desc}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: p.primary ? "rgba(255,255,255,0.6)" : "#9ca3af" }}>
                  {isBusy ? "Please wait…" : p.meta}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
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

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", opacity: 0.6 }}>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
            Payments are securely processed by DodoPayments.
          </p>
        </div>
      </div>
    </div>
  );
}

