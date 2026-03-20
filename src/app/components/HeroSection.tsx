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
      {/* Space to Clouds Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom -z-20 scale-[1.1] brightness-[1.1] transition-transform duration-[20s] animate-subtle-zoom"
        style={{ backgroundImage: `url('/bg-hero.png')` }}
      />

      {/* Fluffy transition at bottom (Smooth light clouds) */}
      <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none z-0 blur-[20px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1000px] flex-col items-center text-center">
        
        <h1 className="mb-6 text-white text-5xl md:text-[84px] font-black tracking-[-0.05em] leading-[0.9] animate-fade-in shadow-text">
           Remove video background<br className="hidden md:block" /> instantly in seconds.
        </h1>

        <p className="mb-14 max-w-[620px] text-lg font-bold text-white/70 md:text-[22px] leading-relaxed animate-fade-in delay-100 shadow-subtext">
           Instant background removal and asset cleaning, offering a flawless creative pipeline from space to sky.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-12 mb-20">
           <button 
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white px-10 py-4 text-zinc-950 font-black text-lg flex items-center gap-4 shadow-[0_24px_80px_rgba(255,b255,255,0.2)] hover:scale-105 active:scale-95 transition-all animate-fade-in delay-200 border border-white"
           >
              Start for free <ArrowRight className="w-5 h-5 text-zinc-400" strokeWidth={3} />
           </button>
        </div>

        {/* The Defined Black-Border Upload Card */}
        <div className="w-full max-w-[760px] animate-fade-in delay-300">
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
            className={`group md:min-h-[460px] cursor-pointer flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] rounded-[56px] border-[1.5px] transition-all duration-700 hover:scale-[1.002] shadow-[0_80px_160px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] py-16 px-8 ${
              isDragging
                ? "border-white bg-white/20"
                : "border-black/20 hover:border-black/40 hover:bg-white/10"
            }`}
          >
            <div className="mb-12 flex h-24 w-24 items-center justify-center bg-white/5 rounded-[36px] border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
               <Upload className="w-12 h-12 text-white" strokeWidth={1} />
            </div>

            <h2 className="mb-3 text-[36px] font-black tracking-tighter text-white shadow-text">
               Drag & Drop to upload
            </h2>
            <p className="text-white font-bold text-xl shadow-subtext opacity-60">
               or <span className="underline decoration-white/40 underline-offset-8 hover:opacity-100 transition-all">browse files</span>
            </p>
            <p className="mt-14 text-white/30 text-[12px] font-black uppercase tracking-[0.3em] shadow-subtext">
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
            <div className="animate-fade-in mt-16 text-sm font-black text-white uppercase tracking-[0.3em] shadow-subtext opacity-40">
               {helperText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
