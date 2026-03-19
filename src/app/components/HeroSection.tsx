"use client";
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
    <section id="upload" className="w-full min-h-[90vh] pt-24 md:pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden">
      <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* Left Column - Content */}
        <div className="flex flex-col items-start gap-6 animate-fade-in mt-12 md:mt-16 lg:mt-0">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            AI · Automatic · Free to start
          </p>

          <h1 className="text-[44px] md:text-[64px] lg:text-[72px] font-black leading-[1.05] tracking-tight text-gray-900 m-0">
            Remove Video <br className="hidden md:block" /> Background <span className="text-gray-300">in seconds.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg m-0 font-medium">
            Upload any video or GIF. AI removes the background frame by frame. Export transparent WebM or swap in any background.
          </p>

          <div className="flex flex-wrap gap-2 items-center mt-2">
            {["MP4, MOV, GIF, WebM", "Max 100MB", "High Quality"].map((tag) => (
              <span key={tag} className="bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-full text-gray-600 text-[13px] font-semibold">
                {tag}
              </span>
            ))}
          </div>

          <div className="w-full h-px bg-gray-100 my-4" />

          <div className="flex gap-10 md:gap-14">
            {[{ v: "100%", l: "Automatic" }, { v: "Free", l: "to Start" }, { v: "< 90s", l: "Fast" }].map(({ v, l }) => (
              <div key={l} className="flex flex-col">
                <div className="text-2xl font-black text-gray-900 leading-tight">{v}</div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Upload Card */}
        <div className="flex justify-center relative animate-slide-in delay-200 lg:-mt-55">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="w-full max-w-[460px] bg-white rounded-[40px] p-6 shadow-2xl shadow-gray-200/80 border border-gray-50 relative group"
          >
            <div className={`border-2 border-dashed rounded-[32px] p-12 md:p-16 flex flex-col items-center text-center transition-all duration-300 ${isDragging ? "border-gray-900 bg-gray-50 scale-[0.98]" : "border-gray-200 bg-white"
              }`}
            >
              {/* Animated SVG Icon */}
              <div className="mb-10 relative group-hover:scale-110 transition-transform duration-500">
                <svg width="100" height="85" viewBox="0 0 100 85" fill="none" className="overflow-visible">
                  {/* Left Page (Video) */}
                  <g transform="translate(18, 30) rotate(-15)" className="opacity-40">
                    <path d="M-18 -26 L 6 -26 A 2 2 0 0 1 8 -24 L 8 -10 L 18 -10 L 18 20 A 2 2 0 0 1 16 22 L -18 22 A 2 2 0 0 1 -20 20 L -20 -24 A 2 2 0 0 1 -18 -26 Z" stroke="#374151" strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
                    <circle cx="-5" cy="-2" r="6" stroke="#111827" strokeWidth="2" />
                  </g>
                  {/* Right Page (GIF) */}
                  <g transform="translate(82, 30) rotate(15)" className="opacity-40">
                    <path d="M-18 -26 L 6 -26 A 2 2 0 0 1 8 -24 L 8 -10 L 18 -10 L 18 20 A 2 2 0 0 1 16 22 L -18 22 A 2 2 0 0 1 -20 20 L -20 -24 A 2 2 0 0 1 -18 -26 Z" stroke="#374151" strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
                    <path d="M-8 -8 L-2 -2 L-8 4" stroke="#111827" strokeWidth="2" strokeLinejoin="round" fill="none" />
                  </g>
                  {/* Center Page (Main) */}
                  <g transform="translate(50, 42)">
                    <path d="M-20 -28 L 8 -28 A 2 2 0 0 1 10 -26 L 10 -10 L 22 -10 L 22 24 A 2 2 0 0 1 20 26 L -20 26 A 2 2 0 0 1 -22 24 L -22 -26 A 2 2 0 0 1 -20 -28 Z" stroke="#1f2937" strokeWidth="2.5" fill="#fdfdfd" strokeLinejoin="round" className="shadow-sm" />
                    <circle cx="-1" cy="0" r="10" stroke="#111827" strokeWidth="2.5" />
                    <path d="M2 -1 L-2 2 L-2 -4 Z" fill="#111827" />
                  </g>
                </svg>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-gray-900 m-0 mb-3 leading-tight tracking-tight">
                Drag & drop <br /> <span className="text-gray-400">videos or GIFs</span>
              </h3>

              <p className="text-[15px] text-gray-500 mb-10 font-medium">
                or <button onClick={() => inputRef.current?.click()} suppressHydrationWarning className="text-gray-900 font-bold underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-all cursor-pointer">browse files</button> on your device
              </p>

              <button
                onClick={() => inputRef.current?.click()}
                suppressHydrationWarning
                className="w-full max-w-[260px] bg-gray-900 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Upload Video
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,image/gif,video/webm"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                className="hidden"
              />
            </div>

            {error && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold text-center shadow-xl animate-fade-in shadow-red-100/50">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Decorative blurred blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-100 rounded-full blur-3xl opacity-50 -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50 -z-10" />
        </div>
      </div>
    </section>
  );
}

