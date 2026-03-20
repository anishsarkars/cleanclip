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
    <div className="w-full flex flex-col items-center pt-16 pb-32 animate-fade-in relative px-6 overflow-hidden min-h-screen">
      
      {/* Floating 3D Elements (Framer Reference Shapes) */}
      <div className="absolute top-[10%] left-[5%] h-52 w-52 opacity-20 blur-md animate-float-3d rotate-[20deg] pointer-events-none">
         <div className="h-full w-full bg-white rounded-3xl border-4 border-white transform skew-x-12 skew-y-12" />
      </div>
      <div className="absolute top-[20%] right-[10%] h-40 w-40 opacity-30 blur-2xl animate-float-3d -rotate-12 pointer-events-none delay-2000">
         <div className="h-full w-full bg-white rounded-full bg-gradient-to-br from-white to-blue-300" />
      </div>
      <div className="absolute bottom-[30%] left-[10%] h-60 w-60 opacity-15 blur-[60px] animate-float-3d rotate-45 pointer-events-none delay-1000">
         <div className="h-full w-full bg-white rounded-[60px]" />
      </div>
      <div className="absolute bottom-[40%] right-[5%] h-48 w-48 opacity-25 blur-lg animate-float-3d -rotate-12 pointer-events-none delay-3000">
         <div className="h-full w-full bg-white/20 border-8 border-white/30 rounded-full" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        
        {/* Social Proof Badge */}
        <div className="glass-panel backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 mb-12 animate-float border-white/30 shadow-xl">
           <div className="flex -space-x-3">
              <div className="h-8 w-8 rounded-full border-2 border-blue-400 bg-zinc-200 ring-4 ring-white/10" />
              <div className="h-8 w-8 rounded-full border-2 border-blue-400 bg-zinc-300 ring-4 ring-white/10" />
              <div className="h-8 w-8 rounded-full border-2 border-blue-400 bg-zinc-400 ring-4 ring-white/10" />
           </div>
           <span className="text-[13px] font-bold tracking-tight text-white/90">6,000+ creators use CleanClip</span>
        </div>

        {/* Heading */}
        <div className="relative mb-8">
           <h1 className="text-5xl md:text-[92px] font-bold tracking-[-0.07em] text-white leading-[0.98] drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] animate-fade-in-up">
              Remove video <br />
              <span className="text-white">background in seconds</span>
           </h1>
           {/* Decorative tick/sparkles from reference */}
           <div className="absolute -top-10 -left-10 text-white/20 text-7xl select-none rotate-12 opacity-30">“</div>
           <div className="absolute -bottom-10 -right-10 text-white/20 text-7xl select-none -rotate-12 opacity-30 animate-pulse">”</div>
        </div>

        {/* Subtext */}
        <p className="max-w-2xl text-[18px] md:text-[22px] font-medium text-white/70 leading-relaxed mb-20 drop-shadow-sm px-4">
           Upload any video or GIF. CleanClip removes background instantly <br className="hidden md:block" /> with neural engine precision.
        </p>

        {/* Main Action Card (The Upload Area) */}
        <div id="upload" className="w-full max-w-4xl px-4 perspective-1000 group">
           <div 
              onClick={onSelectClick}
              className="relative cursor-pointer group animate-fade-in-up delay-200"
           >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-400/30 blur-[100px] opacity-0 group-hover:opacity-100 transition-all duration-700" />
              
              <div className="relative glass-panel rounded-[56px] border border-white/30 bg-white/10 backdrop-blur-[40px] p-2 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)] transition-all duration-700 hover:scale-[1.02] active:scale-[0.99] hover:bg-white/15">
                 
                 <div className="rounded-[48px] bg-gradient-to-br from-white/10 to-transparent py-40 flex flex-col items-center gap-10 border border-white/10">
                    
                    {/* Centered Upload UI */}
                    <div className="flex flex-col items-center gap-8">
                       <div className="h-32 w-32 rounded-full bg-black flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                       </div>
                       
                       <div className="space-y-3">
                          <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Drag & drop files</h3>
                          <p className="text-[13px] font-bold uppercase tracking-[0.4em] text-white/40">INDUSTRIAL NEURAL ENGINE 4.0</p>
                       </div>
                    </div>

                    <div className="relative">
                       <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept="video/*,image/gif"
                       />
                       <div className="px-12 py-5 bg-white text-black text-[15px] font-black rounded-full shadow-[0_15px_35px_rgba(255,255,255,0.3)] transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-[0_20px_45px_rgba(255,255,255,0.4)]">
                          Select video or GIF
                       </div>
                    </div>
                 </div>

                 {helperText && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 text-[13px] font-black text-white uppercase tracking-widest shadow-2xl animate-mesh">
                       {helperText}
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
