"use client";

import React, { useRef } from "react";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  helperText?: string | null;
}

export default function HeroSection({ onFileSelected, helperText }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="w-full flex flex-col items-center pt-12 pb-20 animate-fade-in relative px-6 overflow-hidden min-h-[90vh]">
      
      {/* Floating 3D 'Video Sheets' (Atmospheric background) */}
      <div className="absolute top-[10%] left-[-5%] h-52 w-72 opacity-15 blur-[2px] animate-float rotate-[25deg] pointer-events-none">
         <div className="h-full w-full bg-white rounded-2xl shadow-xl skew-x-12 border border-white/40" />
      </div>
      <div className="absolute top-[15%] right-[-5%] h-48 w-64 opacity-20 blur-[4px] animate-float-3d -rotate-12 pointer-events-none delay-2000">
         <div className="h-full w-full bg-white rounded-2xl shadow-xl border border-white/40" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        
        {/* Social Proof Badge - Minimal style */}
        <div className="glass-pill px-4 py-2 flex items-center gap-3 mb-12 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-transform hover:scale-105">
           <div className="flex -space-x-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="h-7 w-7 rounded-full border-2 border-white" alt="U1" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="h-7 w-7 rounded-full border-2 border-white" alt="U2" />
           </div>
           <span className="text-[13px] font-semibold tracking-tight text-zinc-500">6,000+ creators use CleanClip</span>
        </div>

        {/* Main Action Area - NOW AT THE TOP */}
        <div id="upload" className="w-full max-w-lg mb-12 px-4 group">
           <div 
              onClick={onSelectClick}
              className="relative cursor-pointer group active:scale-[0.98] transition-all duration-300"
           >
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-white/30 blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

              {/* High-quality button-card */}
              <div className="h-[80px] w-full bg-white rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all border border-white group-hover:-translate-y-1">
                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-950 flex items-center justify-center shadow-lg">
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                 </div>
                 <div className="text-left">
                    <p className="text-xl md:text-2xl font-bold text-zinc-950 tracking-[-0.03em] leading-none">Select Video or GIF</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">INDUSTRIAL NEURAL ENGINE</p>
                 </div>
              </div>
              
              <input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleFileChange}
                 accept="video/*,image/gif"
              />
           </div>

           {helperText && (
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.34em] text-white/50">{helperText}</p>
           )}
        </div>

        {/* Heading - Lighter/Refined weight */}
        <div className="relative mb-6 max-w-4xl">
           <h1 className="text-5xl md:text-[80px] font-semibold tracking-[-0.05em] text-white leading-[1.05] drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              Remove video <br />
              <span className="text-white/95">background in seconds.</span>
           </h1>
        </div>

        {/* Subtext */}
        <p className="max-w-md text-[16px] md:text-[19px] font-medium text-white/70 leading-relaxed drop-shadow-sm">
           Neural engine precision for effortless <br className="hidden md:block" /> background removal in any clip.
        </p>

        {/* Bottom Floating Badge (Neural Pro) */}
        <div className="fixed bottom-10 right-10 z-[100] hidden xl:block">
           <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white transition-all hover:-translate-y-1">
              <div className="h-6 w-6 rounded-lg bg-zinc-950 flex items-center justify-center">
                 <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </div>
              <span className="text-[12px] font-bold text-zinc-950 tracking-tight">Neural v4.0 Active</span>
           </div>
        </div>

      </div>
    </div>
  );
}
