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
    <div className="w-full flex flex-col items-center pt-12 pb-20 animate-fade-in relative min-h-[700px]">
      
      {/* Upper Layout: Badge + Title + Sparkles */}
      <div className="relative w-full flex flex-col items-center mb-16 px-4">
        
        {/* 'LOOK COLLECTIONS' circular badge (Left) */}
        <div className="absolute left-0 top-0 hidden xl:flex flex-col items-center gap-2 group cursor-pointer animate-float">
           <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
                 <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                 <text className="text-[10px] uppercase font-bold tracking-[0.1em] fill-zinc-300">
                    <textPath xlinkHref="#circlePath">
                       CLEAN CLIP • BEST AI • CLEAN CLIP • BEST AI •
                    </textPath>
                 </text>
              </svg>
              <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                 <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                 </svg>
              </div>
           </div>
        </div>

        {/* Title Section */}
        <div className="relative text-center z-10 max-w-4xl mx-auto">
           {/* Top Sparkle */}
           <div className="absolute -top-12 left-10 text-yellow-500 text-4xl animate-pulse">✨</div>
           
           <h1 className="text-5xl md:text-[84px] font-bold tracking-[-0.07em] text-zinc-950 leading-[0.95] mb-6">
              Remove Video <br />
              <span className="text-zinc-950">Background</span>
           </h1>
           
           {/* Bottom Sparkle */}
           <div className="absolute bottom-4 -right-12 text-yellow-500 text-4xl animate-pulse delay-700">✨</div>
        </div>

        {/* 'THE TREND THAT YOU NEVER SEE AGAIN' (Right) */}
        <div className="absolute right-0 top-12 hidden xl:block max-w-[200px]">
           <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-950 underline underline-offset-8 decoration-2 decoration-black/10">
              The Engine that <br /> you never see again
           </p>
        </div>
      </div>
      
      {/* Central Collage Area (The Upload Zone) */}
      <div className="w-full max-w-5xl relative flex justify-center items-center">
         
         {/* Floating Demo Card (Left) */}
         <div className="absolute -left-20 top-20 hidden lg:block h-52 w-44 rounded-3xl bg-zinc-100 border border-black/5 p-4 shadow-xl -rotate-6 animate-float">
            <div className="h-full w-full bg-white rounded-2xl flex flex-col items-center justify-center gap-4">
               <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📽️</span>
               </div>
               <div className="h-2 w-24 bg-zinc-100 rounded-full" />
               <div className="h-2 w-16 bg-zinc-50 rounded-full" />
            </div>
         </div>

         {/* 'NEW!' Tag with Stick Figure logic */}
         <div className="absolute top-0 left-12 h-12 w-32 -rotate-12 z-20 animate-bounce-subtle">
            <div className="relative bg-zinc-950 text-white text-[11px] font-bold px-4 py-2 rounded-xl shadow-2xl">
               NEW v4.0AI
               <div className="absolute -bottom-1 left-4 w-2 h-2 bg-zinc-950 rotate-45" />
            </div>
         </div>

         {/* Main Upload Area */}
         <div 
            onClick={onSelectClick}
            className="w-full max-w-[500px] cursor-pointer relative overflow-hidden rounded-[48px] border-2 border-dashed border-black/5 bg-white p-2 text-center transition-all duration-500 hover:border-black/10 hover:shadow-[0_60px_120px_rgba(0,0,0,0.08)] group active:scale-[0.98] z-10"
         >
            <div className="relative overflow-hidden rounded-[40px] bg-zinc-50 py-24 px-10">
               {/* Soft mesh gradient background */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-rose-100/30 animate-mesh opacity-60 pointer-events-none" />
               
               <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="video/*,image/gif"
               />

               <div className="relative z-10 flex flex-col items-center gap-8">
                  <div className="h-24 w-24 flex items-center justify-center rounded-[32px] bg-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                     <svg className="h-10 w-10 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                     </svg>
                  </div>
                  
                  <div className="space-y-3">
                     <h3 className="text-2xl font-bold tracking-tight text-zinc-950">Select File</h3>
                     <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">VIDEO & GIF • MAX 20MB</p>
                  </div>
               </div>

               {helperText && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-white shadow-lg px-6 py-3 rounded-full border border-emerald-100 animate-fade-in">
                     {helperText}
                  </div>
               )}
            </div>
         </div>

         {/* Floating Demo Card (Right) */}
         <div className="absolute -right-20 top-40 hidden lg:block h-48 w-44 rounded-3xl bg-zinc-100 border border-black/5 p-4 shadow-xl rotate-6 animate-float delay-500">
            <div className="h-full w-full bg-white rounded-2xl flex flex-col items-center justify-center gap-4 overflow-hidden">
               <div className="h-full w-full bg-zinc-50 checker border-b border-black/5" />
               <div className="pb-4 flex flex-col items-center">
                  <div className="h-1.5 w-16 bg-zinc-200 rounded-full mb-1" />
                  <div className="h-1.5 w-10 bg-zinc-100 rounded-full" />
               </div>
            </div>
         </div>

         {/* Bottom Status Layout (from reference) */}
         <div className="absolute -bottom-24 left-0 w-full flex justify-between items-center px-4">
            {/* Status 1 (Left) */}
            <div className="flex items-center gap-3 group">
               <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold shadow-lg">1</div>
               <p className="text-[12px] font-bold text-zinc-900 tracking-tight group-hover:underline decoration-zinc-300 underline-offset-4 cursor-help">
                  Always updated in AI technology
               </p>
            </div>

            {/* Quote (Right) */}
            <div className="hidden md:flex flex-col items-end gap-1 max-w-[200px] text-right">
               <p className="text-[11px] font-medium leading-relaxed text-zinc-400 italic">
                  "The most efficient way to clean clips for professional use."
               </p>
               <div className="flex items-center gap-3 mt-1 opacity-60 scale-75">
                  <div className="h-8 w-8 rounded-full bg-zinc-200" />
                  <div className="text-[10px] font-bold uppercase text-zinc-950 tracking-widest">CLEAN CLIP PRO</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
