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
    <div className="w-full flex flex-col items-center pt-8 pb-12 animate-fade-in">
      <div className="relative mb-4">
        <span className="text-yellow-500 absolute -top-8 -right-8 text-3xl rotate-12 animate-pulse">✨</span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.06em] text-zinc-950 text-center leading-[1.05]">
          Remove video background <br /> <span className="text-zinc-400">in seconds</span>
        </h1>
      </div>
      
      <p className="max-w-xl text-center text-zinc-400 text-lg font-medium leading-relaxed mb-16">
        The simplest way to remove backgrounds from videos and GIFs <br /> using our latest high-precision AI engine.
      </p>

      {/* Upload Card - Large Rectangular-ish with Mesh Gradient */}
      <div className="w-full max-w-4xl relative group">
         {/* Subtle floating label */}
         <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 select-none group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-950">Drag or click to upload</span>
         </div>

         <div 
            onClick={onSelectClick}
            className="cursor-pointer relative overflow-hidden rounded-[40px] border border-black/5 bg-zinc-50/50 p-20 text-center transition-all duration-500 hover:border-black/10 hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] group active:scale-[0.99]"
         >
            {/* Soft mesh gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-rose-100/30 animate-mesh opacity-60 pointer-events-none" />
            
            <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileChange}
               accept="video/*,image/gif"
            />

            <div className="relative z-10 flex flex-col items-center gap-6">
               <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-white shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6">
                  <svg className="h-8 w-8 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
               </div>
               
               <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-950">Select Video or GIF</h3>
                  <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-400">MAX 20MB • NO BG LIMIT</p>
               </div>
            </div>

            {helperText && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-100">
                  {helperText}
               </div>
            )}
         </div>

         {/* Playful 'NEW!' tag from reference */}
         <div className="absolute -top-4 -left-10 -rotate-12 select-none">
            <div className="relative bg-zinc-950 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg">
               NEW v4.0AI
               <div className="absolute -bottom-1 left-4 w-2 h-2 bg-zinc-950 rotate-45" />
            </div>
         </div>
      </div>
    </div>
  );
}
