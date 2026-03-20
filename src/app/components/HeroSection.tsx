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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#3B82F6] px-6 pb-20 pt-44">
      
      {/* Background Concentric Rings (Matching Image Style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="absolute w-[1800px] h-[1800px] border-[0.5px] border-white rounded-full" />
        <div className="absolute w-[1400px] h-[1400px] border-[0.5px] border-white rounded-full" />
        <div className="absolute w-[1000px] h-[1000px] border-[0.5px] border-white/60 rounded-full" />
        <div className="absolute w-[600px] h-[600px] border-[0.5px] border-white/20 rounded-full" />
      </div>
      
      {/* Blue Radial Background */}
      <div className="absolute inset-0 bg-radial-gradient" />

      {/* Floating Elements (Icon layout from reference) */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
         {/* Left Side */}
         <div className="absolute top-[28%] left-[10%] animate-float">
            <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/30 backdrop-blur-xl">
               <Camera className="w-10 h-10 text-white/90" strokeWidth={0.8} />
            </div>
         </div>
         <div className="absolute top-[52%] left-[8%] animate-float delay-700">
            <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/20 overflow-hidden group">
               <Clapperboard className="w-12 h-12 text-white/90 group-hover:rotate-6 transition-transform" strokeWidth={0.5} />
            </div>
         </div>
         <div className="absolute bottom-[20%] left-[12%] animate-float delay-500">
            <div className="p-5 glass-card rounded-3xl opacity-60 ring-1 ring-white/10">
               <Network className="w-10 h-10 text-white/60" strokeWidth={0.5} />
            </div>
         </div>

         {/* Right Side */}
         <div className="absolute top-[22%] right-[10%] animate-float delay-1000">
            <div className="p-1 px-[2px] glass-premium rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-white/30 flex items-center">
               <div className="w-20 h-24 bg-zinc-200/50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-zinc-500 m-1">
                  <User className="w-10 h-10 opacity-30" />
               </div>
            </div>
         </div>
         <div className="absolute top-[52%] right-[12%] animate-float delay-200 opacity-60">
            <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/10">
               <User className="w-10 h-10 text-white/50" strokeWidth={0.5} />
            </div>
         </div>
         <div className="absolute bottom-[22%] right-[14%] animate-float delay-400">
            <div className="w-14 h-14 glass-premium rounded-2xl flex items-center justify-center ring-1 ring-white/20">
               <Network className="w-6 h-6 text-white/40" />
            </div>
         </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1000px] flex-col items-center text-center">
        
        <h1 className="mb-8 text-white text-7xl md:text-[92px] font-black tracking-[-0.07em] leading-[0.9] animate-fade-in shadow-text">
           Remove video<br/>background in seconds.
        </h1>

        <p className="mb-6 max-w-[640px] text-lg font-medium text-white/70 md:text-xl leading-relaxed animate-fade-in delay-100 italic">
           Upload any video or GIF. CleanClip removes background<br className="hidden md:block" /> instantly with neural engine precision.
        </p>

        <div className="mb-14 flex items-center justify-center gap-2 opacity-60 animate-fade-in delay-200 font-bold text-white/60 uppercase tracking-[0.3em] text-[10px]">
           600+ users
        </div>

        {/* Frosty Translucent Upload Card */}
        <div className="w-full max-w-2xl animate-fade-in delay-300">
          <div className="glass-premium rounded-[48px] p-4 md:p-6 shadow-[0_48px_140px_rgba(0,0,0,0.15)] ring-1 ring-white/30 backdrop-blur-3xl">
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
              className={`group flex min-h-[440px] cursor-pointer flex-col items-center justify-center rounded-[36px] border-2 transition-all duration-500 relative overflow-hidden ${
                isDragging
                  ? "border-white/50 bg-white/20"
                  : "border-white/10 border-dashed bg-white/10 hover:bg-white/15"
              }`}
            >
              {/* Soft Gradient Overlay like image */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-300/5 to-white/5 pointer-events-none" />

              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 border border-white/30 shadow-sm transition-transform duration-500 group-hover:scale-110">
                 <Upload className="w-10 h-10 text-zinc-800" strokeWidth={1.5} />
              </div>

              <h2 className="mb-2 text-[32px] font-bold tracking-tight text-zinc-900 group-hover:text-zinc-950 transition-colors">
                 Click to upload your video
              </h2>
              <p className="text-zinc-500 font-semibold mb-2">Drop MP4, MOV, GIF</p>

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
            
            {/* The Badge mini-bar from screenshot */}
            <div className="mt-5 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 h-10 px-5 glass-card rounded-full text-[13px] font-bold text-zinc-700 ring-1 ring-white/20">
                     <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                     1.2K
                  </div>
                  <div className="w-10 h-10 glass-card rounded-full flex items-center justify-center ring-1 ring-white/10">
                     <Play className="w-4 h-4 text-zinc-600 fill-zinc-600" />
                  </div>
               </div>
               <div className="flex-1 max-w-[200px] h-[6px] bg-white/20 rounded-full overflow-hidden ml-6">
                  <div 
                    className="h-full w-2/3 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] rounded-full animate-pulse transition-all duration-1000" 
                  />
               </div>
            </div>
          </div>

          {error && (
            <div className="animate-fade-in mt-6 rounded-[24px] border border-red-200/50 bg-white/90 p-4 text-center text-sm font-semibold text-red-600 backdrop-blur-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
