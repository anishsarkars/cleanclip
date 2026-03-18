"use client";

interface PaywallModalProps {
  onUpgrade: (plan: string) => void;
  onClose: () => void;
}

export default function PaywallModal({ onUpgrade, onClose }: PaywallModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      id="paywall-modal"
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div style={{
        position: "relative",
        zIndex: 10,
        background: "#fff",
        borderRadius: 24,
        padding: 32,
        maxWidth: 440,
        width: "100%",
        boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
        textAlign: "center",
      }}>
        {/* Close */}
        <button
          id="paywall-close-btn"
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
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          background: "#111827",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 10 }}>
          You&apos;re out of credits
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 32 }}>
          You&apos;ve used all your free credits for this month. Upgrade for more videos, 720p HD quality, and zero watermarks.
        </p>

        {/* Upgrade Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {/* Monthly */}
          <button
            id="paywall-monthly-btn"
            onClick={() => onUpgrade("monthly")}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderRadius: 16,
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Monthly Plan</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>50 videos · 720p HD · No watermark</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>₹199</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>/month</div>
            </div>
          </button>

          {/* Yearly */}
          <button
            id="paywall-yearly-btn"
            onClick={() => onUpgrade("yearly")}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#111827")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Yearly Plan</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Save 37% · 50 videos/mo · No watermark</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>₹1,499</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>/year</div>
            </div>
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#9ca3af" }}>
          Your 15 monthly free credits will automatically refill in 30 days.
        </p>
      </div>
    </div>
  );
}
