"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Camera, Clapperboard, Network, Heart, Play, User } from "lucide-react";

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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FDFBF7] px-6 pb-20 pt-40">
      
      {/* Background Concentric Rings (Image Style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute w-[1800px] h-[1800px] border border-blue-100 rounded-full" />
        <div className="absolute w-[1400px] h-[1400px] border border-blue-100/60 rounded-full" />
        <div className="absolute w-[1000px] h-[1000px] border border-blue-100/30 rounded-full" />
        <div className="absolute inset-0 bg-radial-gradient" />
      </div>

      {/* Floating Icons (Matching layout in screenshot) */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
         {/* Left Side icons */}
         <div className="absolute top-[28%] left-[10%] animate-float">
            <div className="w-16 h-16 glass-premium rounded-full flex items-center justify-center text-zinc-400/80 shadow-2xl">
               <Camera className="w-8 h-8" strokeWidth={1} />
            </div>
         </div>
         <div className="absolute top-[58%] left-[8%] animate-float delay-700">
            <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center text-zinc-400 overflow-hidden group">
               <Clapperboard className="w-10 h-10 transition-transform group-hover:rotate-12" strokeWidth={0.8} />
            </div>
         </div>
         <div className="absolute bottom-[18%] left-[14%] animate-float delay-500">
            <div className="p-4 glass-card rounded-2xl opacity-60">
               <Network className="w-8 h-8 text-blue-300" strokeWidth={1} />
            </div>
         </div>

         {/* Right Side icons */}
         <div className="absolute top-[22%] right-[10%] animate-float delay-1000">
            <div className="p-1 px-4 glass-premium rounded-[20px] shadow-sm flex items-center gap-3">
               <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-zinc-400">
                  <User className="w-6 h-6" />
               </div>
               <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-blue-100" />
               </div>
            </div>
         </div>
         <div className="absolute top-[52%] right-[12%] animate-float delay-200">
            <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center shadow-xl">
               <User className="w-12 h-12 text-zinc-300/50" strokeWidth={0.5} />
            </div>
         </div>
         <div className="absolute bottom-[22%] right-[15%] animate-float delay-400">
            <div className="w-12 h-12 glass-premium rounded-xl flex items-center justify-center">
               <Network className="w-6 h-6 text-zinc-400" />
            </div>
         </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
        
        {/* Version Badge */}
        <div className="mb-6 animate-fade-in">
           <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-[0.2em] border border-blue-100 shadow-sm">
             <Network className="w-3.5 h-3.5 animate-pulse" />
             Neural Engine 4.0 Pro
           </p>
        </div>

        <h1 className="mb-8 text-black text-6xl md:text-8xl font-black tracking-[-0.06em] leading-[0.92] animate-fade-in shadow-text">
           Remove video<br/>background <span className="text-blue-500">in seconds.</span>
        </h1>

        <p className="mb-4 max-w-[620px] text-lg font-medium text-zinc-400 md:text-xl leading-relaxed animate-fade-in delay-100">
           Upload any video or GIF. CleanClip removes background<br className="hidden md:block" /> instantly with neural engine precision.
        </p>

        <div className="mb-14 flex items-center justify-center gap-2 opacity-50 animate-fade-in delay-200">
           <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">600+ users trust CleanClip</span>
        </div>

        {/* The Master Upload Card (frosty glass style) */}
        <div className="w-full max-w-2xl transform transition-all duration-700 hover:-translate-y-2 animate-fade-in delay-300">
          <div className="glass-premium rounded-[48px] p-4 md:p-6 shadow-[0_40px_120px_rgba(165,203,255,0.2)]">
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
              className={`group flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-[36px] border-2 transition-all duration-300 relative overflow-hidden ${
                isDragging
                  ? "border-blue-300 bg-blue-50/40"
                  : "border-white border-dashed bg-white/50 hover:bg-white/80"
              }`}
            >
              {/* Internal card-glow */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none" />

              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl glass-premium shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                 <Upload className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
              </div>

              <h2 className="mb-3 text-[32px] font-bold tracking-tight text-zinc-950">
                 Click to upload your video
              </h2>
              <p className="text-zinc-400 font-semibold mb-2">Drop MP4, MOV, GIF</p>

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
            
            {/* Bottom mini-bar in the card (as seen in screenshot) */}
            <div className="mt-4 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 h-10 px-4 glass-card rounded-full text-[13px] font-bold text-zinc-500">
                     <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                     1.2K
                  </div>
                  <div className="w-10 h-10 glass-card rounded-full flex items-center justify-center">
                     <Play className="w-4 h-4 text-zinc-400 fill-zinc-400" />
                  </div>
               </div>
               <div className="flex-1 max-w-[200px] h-2 bg-white/40 rounded-full overflow-hidden ml-6">
                  <div className="h-full w-2/3 bg-white shadow-sm rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
               </div>
            </div>
          </div>

          {error && (
            <div className="animate-fade-in mt-6 rounded-[24px] border border-red-100 bg-white/80 p-4 text-center text-sm font-semibold text-red-600 backdrop-blur-md">
              {error}
            </div>
          )}
          
          {helperText && !error && (
            <div className="animate-fade-in mt-6 text-sm font-medium text-zinc-400 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50 backdrop-blur-sm">
               💡 {helperText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
