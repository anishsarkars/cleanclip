"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  helperText?: string | null;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "image/gif", "video/webm"];

export default function HeroSection({ onFileSelected, helperText }: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return "Use MP4, MOV, GIF, or WebM.";
    if (file.size > 20 * 1024 * 1024) return "Maximum file size is 20MB for current capacity.";
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const nextError = validate(file);
      setError(nextError);
      if (!nextError) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-60 pt-60 md:pt-72">
      {/* 🌌 Cinematic OLED Pure Black to Blue Gradient */}
      <div className="absolute inset-0 bg-[#000000] -z-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/80 via-[#1E293B]/40 to-[#2563EB]/40 -z-20" />

      {/* ☁️ Multi-Layer High-Definition Cloud Orchestration (Enhanced Visibility) */}
      <div className="absolute inset-x-0 bottom-0 h-[800px] pointer-events-none z-0">
        {/* Layer 1: Atmospheric Deep Drift */}
        <div
          className="absolute bottom-[-50px] left-[-30%] right-[-30%] h-full bg-cover bg-bottom animate-cloud-drift opacity-60 mix-blend-screen scale-110"
          style={{
            backgroundImage: `url('/bg-clouds-photo.png')`,
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
          }}
        />
        {/* Layer 2: Ethereal Floating Mass */}
        <div
          className="absolute bottom-[-100px] left-[-20%] right-[-20%] h-full bg-cover bg-bottom animate-cloud-float-slow opacity-80 mix-blend-screen"
          style={{
            backgroundImage: `url('/bg-clouds-photo.png')`,
            maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)'
          }}
        />
        {/* Layer 3: Central High-Quality Base */}
        <div
          className="absolute bottom-[-150px] left-[-10%] right-[-10%] h-full bg-cover bg-bottom animate-cloud-pulse opacity-95"
          style={{
            backgroundImage: `url('/bg-clouds-photo.png')`,
            maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)'
          }}
        />
        {/* Layer 4: Soft Ambient Bloom */}
        <div className="absolute bottom-[-200px] left-[-15%] right-[-15%] h-[600px] bg-white blur-[140px] rounded-full opacity-60 mix-blend-overlay animate-pulse" />
      </div>

      {/* 🌫️ Constant High-Quality Overflow Transition to White */}
      <div className="absolute inset-x-0 bottom-0 h-[450px] bg-gradient-to-t from-white via-white/100 to-transparent pointer-events-none z-10" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center text-center translate-y-[-110px]">

        <h1
          className="mb-8 text-white text-1xl md:text-8xl lg:text-7xl font-medium tracking-[-0.03em] leading-tight animate-fade-in shadow-text"
        >
          Remove video background in seconds.
        </h1>

        <p className="mb-14 max-w-[520px] text-lg font-medium text-white/50 md:text-[20px] leading-relaxed animate-fade-in delay-100 shadow-subtext">
          Clean your video's or gif's background with AI.
        </p>

        {/* The Defined Black-Border Upload Card */}
        <div className="w-full max-w-[780px] animate-fade-in delay-200">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group md:min-h-[460px] cursor-pointer flex flex-col items-center justify-center bg-white/5 backdrop-blur-[120px] rounded-[64px] border-[1.5px] transition-all duration-700 hover:scale-[1.002] shadow-[0_80px_160px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] py-16 px-8 ${isDragging
              ? "border-white bg-white/20"
              : "border-black/5 hover:border-black/20 hover:bg-white/10"
              }`}
          >
            <div className="mb-12 flex h-24 w-24 items-center justify-center bg-white/5 rounded-[40px] border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-12 h-12 text-white" strokeWidth={1} />
            </div>

            <h2 className="mb-3 text-[38px] font-black tracking-tighter text-white shadow-text">
              Drag & Drop to upload
            </h2>
            <p className="text-white font-bold text-xl shadow-subtext opacity-50">
              or <span className="underline decoration-white/40 underline-offset-8 hover:opacity-100 transition-all">browse files</span>
            </p>
            <p className="mt-14 text-white/20 text-[12px] font-black uppercase tracking-[0.3em] shadow-subtext">
              MP4, MOV, GIF (MAX. 20MB)
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,image/gif,video/webm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
          </div>

          {error && (
            <div className="animate-fade-in mt-8 rounded-[32px] border border-red-200/50 bg-white/95 p-6 text-center text-sm font-black text-red-600 backdrop-blur-3xl shadow-2xl">
              {error}
            </div>
          )}

          {helperText && !error && (
            <div className="animate-fade-in mt-16 text-sm font-black text-white uppercase tracking-[0.3em] shadow-subtext opacity-30">
              {helperText}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes cloud-drift {
          0% { transform: translateX(0) translateY(0) scale(1.1) rotate(0deg); opacity: 0.5; filter: blur(2px); }
          33% { transform: translateX(5%) translateY(-10px) scale(1.15) rotate(1deg); opacity: 0.7; filter: blur(0px); }
          66% { transform: translateX(-2%) translateY(5px) scale(1.12) rotate(-0.5deg); opacity: 0.6; filter: blur(4px); }
          100% { transform: translateX(0) translateY(0) scale(1.1) rotate(0deg); opacity: 0.5; filter: blur(2px); }
        }
        @keyframes cloud-float-slow {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-40px) translateX(3%) scale(1.05) rotate(0.5deg); opacity: 0.9; }
          100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
        }
        @keyframes cloud-pulse {
          0% { opacity: 0.85; transform: translateY(0) scale(1); filter: brightness(1); }
          50% { opacity: 1.0; transform: translateY(-20px) scale(1.02) filter: brightness(1.2); }
          100% { opacity: 0.85; transform: translateY(0) scale(1) filter: brightness(1); }
        }
        .animate-cloud-drift { animation: cloud-drift 45s ease-in-out infinite; }
        .animate-cloud-float-slow { animation: cloud-float-slow 35s ease-in-out infinite; }
        .animate-cloud-pulse { animation: cloud-pulse 25s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
