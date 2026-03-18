"use client";

const STEPS = [
  {
    n: "01", title: "Upload",
    desc: "Drag & drop or click. MP4, MOV, or GIF. Up to 100MB, 2 minutes.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  },
  {
    n: "02", title: "AI processes",
    desc: "Robust Video Matting removes the background frame by frame automatically.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  },
  {
    n: "03", title: "Preview",
    desc: "Drag slider to compare before & after. Pick transparent, color, or image background.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l-6-6 6-6M15 18l6-6-6-6"/></svg>,
  },
  {
    n: "04", title: "Download",
    desc: "Export transparent WebM. Drop into CapCut, Reels, Shorts, or any editor.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: "#fff", padding: "80px 0" }}>
      <div className="section-container">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 12px" }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 900, lineHeight: 1.1, color: "#111827", margin: 0 }}>
            Four steps.<br />
            <span style={{ color: "#d1d5db" }}>That simple.</span>
          </h2>
        </div>

        {/* Step cards */}
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div
              key={s.n}
              id={`step-${s.n}`}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 900, color: "#e5e7eb", letterSpacing: "0.15em", margin: "0 0 14px" }}>{s.n}</p>
              <div style={{ width: 36, height: 36, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", marginBottom: 14 }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32 }}>
          <a
            href="#upload"
            id="how-it-works-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#111827",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 50,
              textDecoration: "none",
            }}
          >
            Try free — 1 video free
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
