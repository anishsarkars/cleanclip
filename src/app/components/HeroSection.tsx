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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-60 pt-48">
      {/* 🌌 Minimalistic Cinematic Space-to-Blue Gradient */}
      <div className="absolute inset-0 bg-[#020617] -z-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E293B]/50 to-[#2563EB]/40 -z-20" />
      
      {/* ☁️ High Quality Animated Soft Clouds (Bottom Base) */}
      <div className="absolute inset-x-0 bottom-0 h-[500px] pointer-events-none z-0">
          {/* Super-blurred high-definition sphere layers */}
          <div className="absolute bottom-[-150px] left-[-25%] right-[-25%] h-[400px] bg-white blur-[140px] rounded-full opacity-70 animate-cloud-drift" />
          <div className="absolute bottom-[-100px] left-[-15%] right-[-15%] h-[320px] bg-white blur-[120px] rounded-full opacity-50 animate-cloud-float-slow" />
          <div className="absolute bottom-[-200px] left-[-10%] right-[-10%] h-[500px] bg-white blur-[160px] rounded-full opacity-90" />
      </div>

      {/* 🌫️ Fluffy white transition vignette */}
      <div className="absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none z-10" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
        
        <h1 className="mb-6 text-white text-5xl md:text-[88px] font-black tracking-[-0.05em] leading-[0.9] animate-fade-in shadow-text">
           Remove video background<br className="hidden md:block" /> instantly in seconds.
        </h1>

        <p className="mb-14 max-w-[620px] text-lg font-bold text-white/40 md:text-[22px] leading-relaxed animate-fade-in delay-100 shadow-subtext">
           Instant background removal and asset cleaning, offering a flawless creative pipeline from space to sky.
        </p>

        {/* The Precise Black-Border Upload Card */}
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
            className={`group md:min-h-[460px] cursor-pointer flex flex-col items-center justify-center bg-white/5 backdrop-blur-[120px] rounded-[64px] border-[1px] transition-all duration-700 hover:scale-[1.002] shadow-[0_80px_160px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.05)] py-16 px-8 ${
              isDragging
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
          0% { transform: translateX(0) scale(1.1); }
          50% { transform: translateX(5%) scale(1.15); }
          100% { transform: translateX(0) scale(1.1); }
        }
        @keyframes cloud-float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
          100% { transform: translateY(0); }
        }
        .animate-cloud-drift { animation: cloud-drift 25s ease-in-out infinite; }
        .animate-cloud-float-slow { animation: cloud-float-slow 15s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
