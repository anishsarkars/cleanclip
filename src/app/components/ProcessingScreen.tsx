"use client";

interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;   // real step text from backend API
}

const DOTS = [0, 15, 35, 55, 75, 90];

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  const eta = Math.max(0, Math.round(((100 - progress) / 100) * 90));

  return (
    <section style={{
      minHeight: "100vh",
      background: "#fdfdfc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px 40px",
    }}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>

        {/* Spinning ring + icon */}
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 28px" }}>
          <svg
            style={{ width: "100%", height: "100%", animation: "spin 1.8s linear infinite" }}
            viewBox="0 0 72 72"
            fill="none"
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="36" cy="36" r="30" stroke="#e5e7eb" strokeWidth="4"/>
            <path d="M36 6A30 30 0 0 1 66 36" stroke="#111827" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>
          AI is working…
        </h2>

        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fileName}
        </p>

        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 28px" }}>
          {progress < 99 ? `~${eta}s remaining` : "Almost done…"}
        </p>

        {/* Progress bar */}
        <div style={{ height: 6, background: "#e5e7eb", borderRadius: 50, overflow: "hidden", marginBottom: 10 }}>
          <div
            id="progress-bar"
            style={{
              height: "100%",
              background: "#111827",
              borderRadius: 50,
              width: `${progress}%`,
              transition: "width 0.6s ease",
            }}
          />
        </div>

        {/* Step + percent */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span id="step-label" style={{ fontSize: 12, color: "#6b7280", textAlign: "left", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {step || "Processing…"}
          </span>
          <span id="progress-pct" style={{ fontSize: 12, fontWeight: 800, color: "#111827", flexShrink: 0, marginLeft: 8 }}>
            {progress}%
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {DOTS.map((threshold, i) => (
            <div
              key={i}
              style={{
                borderRadius: 50,
                background: progress >= threshold ? "#111827" : "#e5e7eb",
                width: progress >= threshold ? 20 : 6,
                height: 6,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 11, color: "#d1d5db" }}>
          Processing takes 30s–5min depending on video length and frame count
        </p>
      </div>
    </section>
  );
}
