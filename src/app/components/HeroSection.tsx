"use client";

import React, { useRef } from "react";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  helperText?: string | null;
}

export default function HeroSection({ onFileSelected, helperText }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onSelectClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="w-full flex flex-col items-center pt-12 pb-20 animate-fade-in relative px-6 overflow-hidden min-h-[90vh]">
      
      {/* Sidebar Floating Icons (Matching Reference) */}
      <div className="absolute top-[20%] left-[5%] flex flex-col gap-24 opacity-40 pointer-events-none hidden xl:flex">
         <div className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center text-4xl bg-white/5 backdrop-blur-sm animate-float">📸</div>
         <div className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center text-4xl bg-white/5 backdrop-blur-sm animate-float delay-1000">🎞️</div>
         <div className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center text-4xl bg-white/5 backdrop-blur-sm animate-float delay-2000 items-center justify-center">
            <div className="grid grid-cols-2 gap-1 scale-75">
               <div className="h-4 w-4 rounded-full bg-white/40" />
               <div className="h-4 w-4 rounded-full bg-white" />
               <div className="h-4 w-4 rounded-full bg-white/20" />
               <div className="h-4 w-4 rounded-full bg-white/60" />
            </div>
         </div>
      </div>

      <div className="absolute top-[25%] right-[8%] flex flex-col gap-40 opacity-40 pointer-events-none hidden xl:flex">
         <div className="h-24 w-24 rounded-3xl border-2 border-white/20 flex items-center justify-center overflow-hidden bg-white/5 animate-float-3d">
            <div className="h-full w-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center">
               <div className="h-10 w-8 border-2 border-white/40 rounded-t-full" />
            </div>
         </div>
         <div className="h-24 w-24 rounded-full border-2 border-white/20 flex items-center justify-center text-5xl bg-white/5 backdrop-blur-sm animate-float-3d delay-2000">👤</div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        
        {/* Heading Section */}
        <div className="max-w-4xl mb-6">
           <h1 className="text-5xl md:text-[84px] font-black tracking-[-0.05em] text-white leading-tight drop-shadow-2xl">
              Remove video <br />
              background in seconds.
           </h1>
        </div>

        {/* Subtext Section */}
        <div className="mb-14 space-y-4">
           <p className="max-w-xl text-[16px] md:text-[19px] font-medium text-white/70 leading-relaxed mx-auto">
              Upload any video or GIF. CleanClip removes background <br className="hidden md:block" /> instantly with neural engine precision.
           </p>
           <p className="text-[13px] font-bold text-white/40 uppercase tracking-widest">600+ users</p>
        </div>

        {/* The Action Dashboard (The Giant Glass Card) */}
        <div id="upload" className="w-full max-w-4xl px-4 animate-fade-in-up delay-200">
           <div className="glass-container rounded-[40px] p-6 pb-12 transition-all hover:shadow-[0_60px_120px_rgba(0,0,0,0.4)]">
              
              {/* Top Section Padding for spacing */}
              <div className="h-10" />

              {/* Central Inner Upload Card */}
              <div 
                onClick={onSelectClick}
                className="max-w-2xl mx-auto w-full group cursor-pointer"
              >
                <div className="glass-card-inner rounded-[32px] py-24 flex flex-col items-center gap-8 border-white/10 transition-all group-hover:bg-white/15 group-hover:scale-[1.01] active:scale-[0.99] shadow-2xl">
                   
                   {/* Cloud Icon */}
                   <div className="h-20 w-20 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                   </div>

                   <div className="space-y-2">
                      <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Click to upload your video</h3>
                      <p className="text-lg md:text-2xl font-medium text-white/40">Drop MP4, MOV, GIF</p>
                   </div>

                   <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept="video/*,image/gif"
                   />
                </div>
              </div>

              {/* Bottom Metadata Bar */}
              <div className="mt-16 max-w-2xl mx-auto flex items-center gap-6">
                 
                 {/* Like Pill */}
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl shadow-lg">
                    <span className="text-xl">❤️</span>
                    <span className="font-bold text-lg text-white">1.2K</span>
                 </div>

                 {/* Icon Box */}
                 <div className="h-14 w-14 flex items-center justify-center bg-white/10 border border-white/20 rounded-2xl shadow-lg">
                    <svg className="w-7 h-7 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M10 8l6 4-6 4V8z" />
                       <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm10 8a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                    </svg>
                 </div>

                 {/* Symbolic Progress Bar */}
                 <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                    <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-white/10 via-white/40 to-white/10 rounded-full" />
                 </div>

                 {helperText && (
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 animate-pulse">
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
