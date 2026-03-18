"use client";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "image/gif", "video/webm"];

export default function HeroSection({ onFileSelected }: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File) => {
    if (!ACCEPTED.includes(f.type)) return "Use MP4, MOV, or GIF.";
    if (f.size > 100 * 1024 * 1024) return "Max 100MB.";
    return null;
  };

  const handleFile = useCallback((f: File) => {
    setError(null);
    const e = validate(f);
    if (e) { setError(e); return; }
    onFileSelected(f);
  }, [onFileSelected]);

  return (
    <section
      id="upload"
      style={{
        background: "#fdfdfc",
        width: "100%",
        minHeight: "100vh",
        padding: "120px 20px 80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      <div style={{
        maxWidth: 1160,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "80px",
        alignItems: "center",
        justifyContent: "space-between"
      }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280", margin: 0 }}>
            AI · Automatic · Free to start
          </p>

          <h1 style={{
            fontSize: "clamp(48px, 6vw, 76px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#111827",
            margin: 0
          }}>
            Remove Video Background <br /> in seconds.
          </h1>

          <p style={{
            fontSize: 18,
            color: "#4b5563",
            lineHeight: 1.6,
            maxWidth: 500,
            margin: 0,
            fontWeight: 400
          }}>
            Upload any video or GIF. AI removes the background frame by frame. Export transparent WebM or swap in any background.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", alignItems: "center", marginTop: 8 }}>
            <span style={{ background: "#f3f4f6", padding: "6px 14px", borderRadius: 20, color: "#374151", fontSize: 14, fontWeight: 500 }}>MP4, MOV, GIF, WebM</span>
            <span style={{ background: "#f3f4f6", padding: "6px 14px", borderRadius: 20, color: "#374151", fontSize: 14, fontWeight: 500 }}>Max 100MB</span>
            {/* <span style={{background: "#f3f4f6", padding: "6px 14px", borderRadius: 20, color: "#374151", fontSize: 14, fontWeight: 500}}>✨ 15 Free Credits monthly</span> */}
          </div>

          <div style={{ height: 1, width: "100%", maxWidth: 480, background: "#e5e7eb", margin: "16px 0" }} />

          <div style={{ display: "flex", gap: "40px" }}>
            {[{ v: "100%", l: "Automatic" }, { v: "Free", l: "to Start" }, { v: "< 90s", l: "Processing" }].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{v}</div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

        </div>

        {/* ══ RIGHT COLUMN (UPLOAD CARD) ══ */}
        <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", position: "relative" }}>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#ffffff",
              borderRadius: 32,
              padding: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.08)",
              position: "relative"
            }}
          >
            <div style={{
              border: `2px dashed ${isDragging ? "#111827" : "#d1d5db"}`,
              borderRadius: 24,
              padding: "60px 32px 50px",
              background: isDragging ? "#f9fafb" : "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "all 0.2s ease"
            }}>
              {/* Custom 3 Pages SVG Icon matching the image, recolored to B&W */}
              <svg width="100" height="85" viewBox="0 0 100 85" fill="none" style={{ overflow: "visible", marginBottom: 28 }}>

                {/* Left Page (Video) */}
                <g transform="translate(18, 30) rotate(-15)">
                  <path d="M-18 -26 L 6 -26 A 2 2 0 0 1 8 -24 L 8 -10 L 18 -10 L 18 20 A 2 2 0 0 1 16 22 L -18 22 A 2 2 0 0 1 -20 20 L -20 -24 A 2 2 0 0 1 -18 -26 Z" stroke="#374151" strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
                  <path d="M 8 -26 L 8 -10 L 20 -10" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="-5" cy="-2" r="6" stroke="#111827" strokeWidth="2" />
                  <path d="M-2 -2 L-7 1.5 L-7 -5.5 Z" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" fill="#111827" />
                </g>

                {/* Right Page (GIF/Generic representation) */}
                <g transform="translate(82, 30) rotate(15)">
                  <path d="M-18 -26 L 6 -26 A 2 2 0 0 1 8 -24 L 8 -10 L 18 -10 L 18 20 A 2 2 0 0 1 16 22 L -18 22 A 2 2 0 0 1 -20 20 L -20 -24 A 2 2 0 0 1 -18 -26 Z" stroke="#374151" strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
                  <path d="M 8 -26 L 8 -10 L 20 -10" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="-8" cy="-8" r="2" fill="#111827" />
                  <circle cx="-2" cy="-2" r="2" fill="#111827" />
                  <circle cx="-8" cy="4" r="2" fill="#111827" />
                  <path d="M-8 -8 L-2 -2 L-8 4" stroke="#111827" strokeWidth="2" strokeLinejoin="round" fill="none" />
                </g>

                {/* Center Page (Main Video/MP4) */}
                <g transform="translate(50, 42)">
                  <path d="M-20 -28 L 8 -28 A 2 2 0 0 1 10 -26 L 10 -10 L 22 -10 L 22 24 A 2 2 0 0 1 20 26 L -20 26 A 2 2 0 0 1 -22 24 L -22 -26 A 2 2 0 0 1 -20 -28 Z" stroke="#1f2937" strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
                  <path d="M 10 -28 L 10 -10 L 24 -10" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="-5" cy="-8" r="4" stroke="#111827" strokeWidth="2.5" />
                  <path d="M -22 14 L -8 0 L 2 10 L 10 2 L 22 14" stroke="#111827" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                </g>

              </svg>

              <h3 style={{ fontSize: "clamp(20px, 2.5vw, 24px)", color: "#111827", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.3 }}>
                Drag & drop <span style={{ color: "#6b7280" }}>videos</span><br />
                or <span style={{ color: "#6b7280" }}>GIFs</span>
              </h3>

              <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 40px", fontWeight: 500 }}>
                or <button suppressHydrationWarning onClick={() => inputRef.current?.click()} style={{ background: "none", border: "none", color: "#111827", fontSize: 15, fontWeight: 700, padding: 0, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", fontFamily: "inherit" }}>browse files</button> on your computer
              </p>

              <button
                suppressHydrationWarning
                onClick={() => inputRef.current?.click()}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 240,
                  background: "#111827",
                  color: "#fff",
                  border: "none",
                  borderRadius: 100,
                  padding: "16px 48px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.15s, background 0.15s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.background = "#000000"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#111827"; }}
              >
                Upload Video
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,image/gif,video/webm"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                style={{ display: "none" }}
              />
            </div>

            {error && (
              <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: "90%", padding: "12px 16px", background: "#fef2f2", color: "#ef4444", borderRadius: 14, fontSize: 14, fontWeight: 600, textAlign: "center", border: "1px solid #fee2e2", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
