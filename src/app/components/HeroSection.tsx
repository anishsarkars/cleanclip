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
    <div className="w-full flex flex-col items-center pt-24 pb-32 animate-fade-in relative px-6 overflow-hidden min-h-screen">
      
      {/* Floating 3D 'Video Sheets' (Mimicking reference envelope depth) */}
      <div className="absolute top-[15%] left-[-2%] h-60 w-80 opacity-20 blur-[1px] animate-float rotate-[25deg] pointer-events-none">
         <div className="h-full w-full bg-white rounded-3xl shadow-2xl skew-x-12 flex items-center justify-center border border-white/60">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl">🎬</div>
         </div>
      </div>
      <div className="absolute top-[20%] right-[-5%] h-52 w-80 opacity-25 blur-[2px] animate-float-3d -rotate-12 pointer-events-none delay-2000">
         <div className="h-full w-full bg-white rounded-3xl shadow-2xl -skew-x-6 border border-white/60" />
      </div>
      <div className="absolute bottom-[25%] left-[-5%] h-48 w-72 opacity-20 blur-[4px] animate-float-3d rotate-12 pointer-events-none delay-1000">
         <div className="h-full w-full bg-white rounded-3xl shadow-2xl skew-y-6 border border-white/60" />
      </div>
      <div className="absolute bottom-[10%] right-[0%] h-52 w-80 opacity-15 blur-[6px] animate-float -rotate-6 pointer-events-none delay-3000">
         <div className="h-full w-full bg-white rounded-3xl shadow-xl border border-white/60" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        
        {/* Social Proof Badge - Real Avatars style */}
        <div className="glass-pill px-6 py-3 flex items-center gap-4 mb-16 shadow-[0_20px_60px_rgba(0,0,0,0.1)] scale-110">
           <div className="flex -space-x-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="h-9 w-9 rounded-full bg-zinc-200 border-2 border-white shadow-sm" alt="U1" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="h-9 w-9 rounded-full bg-zinc-300 border-2 border-white shadow-sm" alt="U2" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper" className="h-9 w-9 rounded-full bg-zinc-400 border-2 border-white shadow-sm" alt="U3" />
           </div>
           <span className="text-[14px] font-bold tracking-tight text-zinc-500">6,000+ creators use CleanClip</span>
        </div>

        {/* Heading - Blockier/Tighter weight */}
        <div className="relative mb-10 max-w-5xl">
           <h1 className="text-6xl md:text-[116px] font-black tracking-[-0.07em] text-white leading-[0.9] drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
              Remove video <br />
              <span className="text-white">background in seconds.</span>
           </h1>
           {/* Decorative tick elements from reference style */}
           <div className="hidden xl:block absolute -top-12 -left-20 opacity-20 rotate-12">
              <svg className="h-32 w-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
           </div>
        </div>

        {/* Subtext */}
        <p className="max-w-xl text-[18px] md:text-[21px] font-medium text-white/70 leading-relaxed mb-20 drop-shadow-sm">
           Upload any video or GIF. CleanClip removes background <br className="hidden md:block" /> instantly with neural engine precision.
        </p>

        {/* Main Action Area */}
        <div id="upload" className="w-full max-w-xl mb-40 px-4 group">
           <div 
              onClick={onSelectClick}
              className="relative cursor-pointer group active:scale-[0.98] transition-all duration-300"
           >
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-white/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

              {/* Reference-style deep shadow button layout */}
              <div className="h-[84px] w-full bg-white rounded-3xl flex items-center justify-center gap-4 shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_90px_rgba(0,0,0,0.25)] transition-all border border-white">
                 <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                 </div>
                 <span className="text-2xl font-black text-zinc-950 tracking-[-0.03em]">Select Video or GIF</span>
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
              <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.4em] text-white/50 animate-pulse">{helperText}</p>
           )}
        </div>

        {/* Bottom Floating Badge (Neural Pro) */}
        <div className="fixed bottom-10 right-10 z-[100] hidden lg:block animate-fade-in delay-1000">
           <div className="bg-white px-6 py-4 rounded-3xl shadow-3xl flex items-center gap-4 border border-zinc-100 transition-all hover:-translate-y-2">
              <div className="h-8 w-8 rounded-[10px] bg-zinc-950 flex items-center justify-center">
                 <div className="h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)] animate-pulse" />
              </div>
              <span className="text-[14px] font-black text-zinc-950 tracking-[-0.02em] leading-none">Powered by <br/><span className="text-blue-500">Neural Engine 4.0</span></span>
           </div>
        </div>

      </div>
    </div>
  );
}
