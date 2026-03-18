"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BillingSuccessInner() {
  const sp = useSearchParams();
  const plan = sp.get("plan") || "";
  const status = sp.get("status") || "";
  const paymentId = sp.get("payment_id") || sp.get("paymentId") || "";

  return (
    <main style={{ minHeight: "100vh", background: "#fff", padding: "90px 24px 40px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
          Payment received
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 }}>
          If you completed checkout, you’ll be upgraded shortly. You can safely close this page.
        </p>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            background: "#fafafa",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 10, columnGap: 14 }}>
            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 800 }}>Plan</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 800 }}>
              {plan || "—"}
            </div>

            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 800 }}>Status</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 800 }}>
              {status || "—"}
            </div>

            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 800 }}>Payment ID</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 800, overflowWrap: "anywhere" }}>
              {paymentId || "—"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 18px",
              borderRadius: 999,
              background: "#111827",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Back to app
          </Link>
          <Link
            href="/#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 18px",
              borderRadius: 999,
              background: "#fff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            View pricing
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 18, lineHeight: 1.6 }}>
          Note: Your backend still needs a webhook handler to grant credits automatically after payment.
        </p>
      </div>
    </main>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#fff", padding: "90px 24px 40px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: 0 }}>Loading…</h1>
          </div>
        </main>
      }
    >
      <BillingSuccessInner />
    </Suspense>
  );
}

