"use client";

import { useCallback, useRef, useState } from "react";

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
    if (file.size > 20 * 1024 * 1024) return "Maximum file size is 20MB.";
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
    <div className="w-full max-w-[620px] mx-auto">
      <div className="relative group">
        {/* Decorative corner sparkles */}
        <div className="absolute -top-4 -left-4 h-8 w-8 text-yellow-500 rotate-[-15deg] opacity-40">
           <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
        </div>

        <div className="w-full rounded-[40px] border border-black/5 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.03)] backdrop-blur-md">
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
            className={`flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border transition-all duration-300 ${
              isDragging
                ? "border-black/20 bg-zinc-50 scale-[0.995]"
                : "border-zinc-100 bg-[#fffdf2]/50"
            }`}
          >
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-black/[0.03]">
               <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-zinc-950 relative"
                  >
                    <path d="M12 16V7" strokeLinecap="round" />
                    <path d="M8.5 10.5 12 7l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
               </div>
            </div>

            <div className="space-y-2 mb-8 px-6 text-center">
               <h2 className="text-[28px] font-bold tracking-tight text-zinc-950">
                  Drop your video here
               </h2>
               <p className="text-[14px] font-medium text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  Fastest background removal for MP4, MOV, GIF & WebM up to 20MB.
               </p>
            </div>

            <button
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-full bg-zinc-950 px-10 py-4 text-[13px] font-bold uppercase tracking-[0.15em] text-white shadow-xl shadow-black/10 transition-all hover:bg-black hover:shadow-black/20 active:scale-[0.98]"
            >
              Select Material
            </button>

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

          {error ? (
            <div className="animate-fade-in mt-4 rounded-2xl border border-red-50 bg-red-50/50 px-4 py-3 text-center text-[13px] font-bold text-red-500">
              {error}
            </div>
          ) : helperText ? (
             <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 text-center">
                {helperText}
             </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
