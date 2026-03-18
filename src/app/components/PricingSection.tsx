"use client";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    label: "FOR CASUAL USERS",
    desc: "15 videos every month. Perfect for hobbyists.",
    price: "₹0",
    period: "/mo",
    cta: "Current Plan",
    features: [
      "15 videos/month",
      "Up to 480p resolution",
      "30 sec length limit",
      "Standard watermark",
      "Standard processing speed",
    ],
    dark: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    label: "MOST POPULAR",
    desc: "Higher quality, no watermark. Great for creators.",
    price: "₹199",
    period: "/mo",
    cta: "Upgrade to Monthly",
    badge: "🔥 BEST VALUE",
    badgeStyle: { background: "#111827", color: "#fff" },
    features: [
      "50 videos/month",
      "Up to 720p HD resolution",
      "120 sec length limit",
      "No Watermark",
      "Faster processing speed",
    ],
    dark: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    label: "FOR PROFESSIONALS",
    desc: "Best value. Save 37% with an annual subscription.",
    price: "₹1,499",
    period: "/yr",
    cta: "Get Yearly Access",
    badge: "SAVING 37%",
    badgeStyle: { background: "#22c55e", color: "#fff" },
    features: [
      "50 videos/month",
      "Up to 720p HD resolution",
      "120 sec length limit",
      "Zero Watermark",
      "Priority processing speed",
    ],
    dark: false,
  },
];

interface PricingSectionProps {
  onUpgrade?: (planId: string) => void;
}

export default function PricingSection({ onUpgrade }: PricingSectionProps) {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgradeClick = async (id: string) => {
    if (id === "free" || !onUpgrade) return;
    setUpgrading(id);
    try {
      await onUpgrade(id);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <section id="pricing" style={{ padding: "80px 0", background: "#fff" }}>
      <div className="section-container">
        
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 }}>
            Simple Pricing
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 42px)", fontWeight: 900, color: "#111827", margin: 0 }}>
            Choose your plan
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 12 }}>
            Every user gets 15 free credits every month. Refills automatically.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          alignItems: "stretch",
        }}>
          {PLANS.map((p) => (
            <div
              key={p.id}
              style={{
                background: p.dark ? "#111827" : "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 24,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.08)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.02)";
              }}
            >
              {/* Badge */}
              <div style={{ height: 24, marginBottom: 12 }}>
                {p.badge && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 50, ...p.badgeStyle }}>
                    {p.badge}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: p.dark ? "rgba(255,255,255,0.35)" : "#9ca3af", margin: "0 0 4px" }}>
                {p.label}
              </p>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: p.dark ? "#fff" : "#111827", margin: "0 0 8px" }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 12, color: p.dark ? "rgba(255,255,255,0.45)" : "#9ca3af", margin: "0 0 16px", lineHeight: 1.5 }}>
                {p.desc}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, color: p.dark ? "#fff" : "#111827" }}>
                  {p.price}
                </span>
                <span style={{ fontSize: 13, color: p.dark ? "rgba(255,255,255,0.35)" : "#9ca3af", marginBottom: 6 }}>
                  {p.period}
                </span>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={p.dark ? "#fff" : "#111827"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span style={{ fontSize: 13, color: p.dark ? "rgba(255,255,255,0.8)" : "#374151" }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                suppressHydrationWarning
                onClick={() => handleUpgradeClick(p.id)}
                disabled={upgrading === p.id || p.id === "free"}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  border: p.dark ? "none" : "1px solid #e5e7eb",
                  background: p.dark ? "#fff" : "#fff",
                  color: "#111827",
                  cursor: (upgrading === p.id || p.id === "free") ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: (upgrading && upgrading !== p.id) ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (p.id !== "free") e.currentTarget.style.background = p.dark ? "#f3f4f6" : "#f9fafb";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                {upgrading === p.id ? "Connecting..." : p.cta}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 40 }}>
          Prices include GST. Monthly credits reset exactly 30 days after your first use.
        </p>

      </div>
    </section>
  );
}
