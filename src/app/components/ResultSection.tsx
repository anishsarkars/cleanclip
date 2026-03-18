"use client";
import { useCallback, useRef, useState } from "react";

interface ResultSectionProps {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  onReset: () => void;
  onDownload: () => void;
}

type BgOption = "transparent" | "color" | "image";

const BG_COLORS = [
  "#ffffff", "#000000", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#8b5cf6",
];

export default function ResultSection({ originalUrl, processedUrl, fileName, onReset, onDownload }: ResultSectionProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderMove(e.clientX);
    const move = (ev: MouseEvent) => handleSliderMove(ev.clientX);
    const up = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
    const move = (ev: TouchEvent) => handleSliderMove(ev.touches[0].clientX);
    const end = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", end);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
      setBgOption("image");
    }
  };

  const outputName = fileName.replace(/\.[^.]+$/, "_no_bg.webm");

  return (
    <section style={{ padding: "64px 0", background: "#fdfdfc" }}>
      <div className="section-container">
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: 0 }}>Background removed ✓</h2>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Drag the slider to compare</p>
          </div>
          <button
            id="new-video-btn"
            onClick={onReset}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 50, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New video
          </button>
        </div>

        {/* Before/After slider */}
        <div
          id="before-after-slider"
          ref={containerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 20,
            overflow: "hidden",
            background: "#fff",
            cursor: "col-resize",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          }}
        >
          {/* "Before" — original */}
          <video
            src={originalUrl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay loop muted playsInline
          />

          {/* "After" — processed */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${sliderPos}%`,
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            {/* Background layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                ...(bgOption === "transparent"
                  ? {}
                  : bgOption === "color"
                  ? { background: bgColor }
                  : bgImage
                  ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : {}),
              }}
            />
            {bgOption === "transparent" && (
              <div className="checker" style={{ position: "absolute", inset: 0 }} />
            )}
            <video
              src={processedUrl}
              style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100%", objectFit: "cover" }}
              autoPlay loop muted playsInline
            />
          </div>

          {/* Divider line */}
          <div
            style={{ position: "absolute", top: 0, bottom: 0, left: `${sliderPos}%`, width: 2, background: "#fff", zIndex: 20, boxShadow: "0 0 10px rgba(0,0,0,0.3)" }}
          />

          {/* Drag handle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${sliderPos}%`,
              transform: "translate(-50%, -50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5">
              <path d="M9 18l-6-6 6-6M15 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Labels */}
          <div style={{ position: "absolute", top: 12, left: 12, padding: "2px 10px", borderRadius: 50, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)", zIndex: 20 }}>Before</div>
          <div style={{ position: "absolute", top: 12, right: 12, padding: "2px 10px", borderRadius: 50, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)", zIndex: 20 }}>After</div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 24, padding: 24, borderRadius: 20, background: "#fff", border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Select Background</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {(["transparent", "color", "image"] as BgOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setBgOption(opt)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  ...(bgOption === opt ? { background: "#111827", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }),
                }}
              >
                {opt === "transparent" ? "✨ Transparent" : opt === "color" ? "🎨 Color" : "🖼 Image"}
              </button>
            ))}
          </div>

          {bgOption === "color" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: bgColor === c ? "2px solid #111827" : "1px solid #e5e7eb", cursor: "pointer", transition: "transform 0.1s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: 32, height: 32, padding: 0, borderRadius: "50%", border: "1px solid #e5e7eb", cursor: "pointer" }} />
            </div>
          )}

          {bgOption === "image" && (
            <div>
              <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} style={{ display: "none" }} />
              <button
                onClick={() => bgInputRef.current?.click()}
                style={{ padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 600, background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}
              >
                {bgImage ? "Change Background" : "Upload Background Image"}
              </button>
            </div>
          )}
        </div>

        {/* Download */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={onDownload}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              width: "100%",
              padding: "16px",
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 20,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download Video
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12 }}>
            Free plan includes watermark · <a href="#pricing" style={{ color: "#111827", fontWeight: 600, textDecoration: "none" }}>Upgrade for HD</a>
          </p>
        </div>

      </div>
    </section>
  );
}
