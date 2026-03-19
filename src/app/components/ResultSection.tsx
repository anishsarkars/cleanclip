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
    handleSliderMove(e.clientX);
    const move = (ev: MouseEvent) => handleSliderMove(ev.clientX);
    const up = () => {
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

  return (
    <section className="py-20 md:py-24 bg-white animate-fade-in">
      <div className="section-container">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 m-0">Background removed ✓</h2>
            <p className="text-gray-400 font-medium mt-2">Compare results and customize background</p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 px-6 py-2.5 text-[13px] font-bold text-gray-500 border border-gray-100 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload New
          </button>
        </div>

        {/* Before/After slider */}
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="relative w-full aspect-video rounded-[32px] md:rounded-[40px] overflow-hidden bg-gray-50 cursor-col-resize shadow-2xl shadow-gray-200 group border-8 border-white"
        >
          {/* "Before" — original */}
          <video
            src={originalUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay loop muted playsInline
          />

          {/* "After" — processed */}
          <div
            className="absolute inset-0 h-full overflow-hidden z-10"
            style={{ width: `${sliderPos}%` }}
          >
            {/* Background layer */}
            <div
              className={`absolute inset-0 ${bgOption === "transparent" ? "checker" : ""}`}
              style={{
                ...(bgOption === "color" ? { background: bgColor } : {}),
                ...(bgOption === "image" && bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
              }}
            />
            <video
              src={processedUrl}
              className="absolute inset-0 object-cover"
              style={{ width: `${100 * (100 / sliderPos)}%`, maxWidth: "none" }}
              autoPlay loop muted playsInline
            />
          </div>

          {/* Divider line & handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="3">
                <path d="M9 18l-6-6 6-6M15 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/40 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md z-30">Before</div>
          <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-black/40 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md z-30">After</div>
        </div>

        {/* Bottom Controls Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Background Selector */}
          <div className="lg:col-span-2 p-8 rounded-[32px] bg-gray-50 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Customize Background</h3>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {(["transparent", "color", "image"] as BgOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBgOption(opt)}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    bgOption === opt 
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105" 
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {opt === "transparent" ? "✨ Transparent" : opt === "color" ? "🎨 Solid Color" : "🖼 Custom Image"}
                </button>
              ))}
            </div>

            {bgOption === "color" && (
              <div className="flex flex-wrap gap-3 animate-fade-in">
                {BG_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`w-10 h-10 rounded-xl border-4 transition-transform hover:scale-110 cursor-pointer ${
                      bgColor === c ? "border-gray-900 scale-110" : "border-white"
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <div className="relative w-10 h-10 rounded-xl border-4 border-white overflow-hidden shadow-sm">
                   <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                </div>
              </div>
            )}

            {bgOption === "image" && (
              <div className="animate-fade-in">
                <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-gray-100 text-[13px] font-bold text-gray-900 hover:border-gray-900 transition-all cursor-pointer shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {bgImage ? "Replace Background Image" : "Upload High-Res Background"}
                </button>
              </div>
            )}
          </div>

          {/* Download Card */}
          <div className="flex flex-col p-8 rounded-[32px] bg-gray-900 text-white shadow-2xl shadow-gray-900/20">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6">Final Export</h3>
             
             <div className="mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Filename</p>
                <p className="text-lg font-black truncate">{fileName.replace(/\.[^.]+$/, "")}<span className="text-gray-600">_clean.webm</span></p>
             </div>

             <button
              onClick={onDownload}
              className="mt-auto group flex items-center justify-center gap-3 w-full py-5 bg-white text-gray-900 rounded-2xl text-[16px] font-black hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-y-0.5 transition-transform">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download Video
            </button>
            
            <p className="text-center text-[11px] text-gray-500 mt-4 font-medium uppercase tracking-tighter">
              Standard Quality Included · <a href="#pricing" className="text-white hover:underline">Get 4K Pro</a>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

