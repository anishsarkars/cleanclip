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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-40 pt-12 md:pt-4">
      {/* Background Sky & Clouds */}
      <div className="absolute inset-0 bg-sky -z-10" />
      
      {/* Fluffy Animated Clouds at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-96 -z-10 opacity-80 animate-clouds">
         <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto translate-y-20">
            <path fill="#ffffff" fillOpacity="1" d="M0,128L48,128C96,128,192,128,288,149.3C384,171,480,213,576,213.3C672,213,768,171,864,138.7C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
         <svg viewBox="0 0 1440 320" className="absolute bottom-4 w-full h-auto translate-y-24 opacity-50 blur-xl">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,224C672,245,768,235,864,208C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1000px] flex-col items-center text-center">
        
        <h1 className="mb-8 text-white text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in">
           Clean up and process<br/>your clips instantly
        </h1>

        <p className="mb-10 max-w-[620px] text-lg font-medium text-white/80 md:text-[20px] leading-relaxed animate-fade-in delay-100">
           Our professional tool for instant background removal and<br className="hidden md:block"/> asset cleaning, offering a flawless creative pipeline.
        </p>

        <button 
           onClick={() => inputRef.current?.click()}
           className="mb-16 rounded-full bg-white px-8 py-3.5 text-zinc-800 font-bold text-base flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all animate-fade-in delay-200"
        >
           Start for free <ArrowRight className="w-5 h-5" />
        </button>

        {/* The Aero Glow Upload Card (match exact style) */}
        <div className="w-full max-w-[720px] animate-fade-in delay-300">
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
            className={`group flex min-h-[380px] cursor-pointer flex-col items-center justify-center glass-aero rounded-[48px] border-[1.5px] transition-all duration-300 ${
              isDragging
                ? "border-white bg-white/20"
                : "border-white/40 bg-white/10 hover:bg-white/15"
            }`}
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center">
               <Upload className="w-14 h-14 text-white" strokeWidth={1} />
            </div>

            <h2 className="mb-2 text-[32px] font-extrabold tracking-tight text-white">
               Drag & Drop to upload
            </h2>
            <p className="text-white font-medium text-lg">
               or <span className="underline decoration-white/50 underline-offset-4 hover:text-blue-50 transition-colors">browse files</span>
            </p>
            <p className="mt-4 text-white/60 text-sm font-bold uppercase tracking-widest">
               MP4, MOV, PNG, JPG (max. 100MB)
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
            <div className="animate-fade-in mt-6 rounded-[24px] border border-red-200/50 bg-white/90 p-4 text-center text-sm font-semibold text-red-600 backdrop-blur-md">
              {error}
            </div>
          )}
          
          {helperText && !error && (
            <div className="animate-fade-in mt-10 text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
               {helperText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
