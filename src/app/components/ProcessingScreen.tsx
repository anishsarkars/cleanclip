"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
  startTime?: string | null;
  onUpgrade?: () => void;
}

export default function ProcessingScreen({ fileName, progress, step, startTime, onUpgrade }: ProcessingScreenProps) {
  const [timeLeft, setTimeLeft] = useState<string>("Calculating...");
  
  // Display only the core status message
  const displayStep = step?.split(" (")[0] || "AI Neural Engine Active...";

  useEffect(() => {
    if (!startTime || progress <= 10) {
      setTimeLeft("Calculating...");
      return;
    }

    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedMs = now - start;
    if (elapsedMs <= 0) return;

    const totalEstimatedMs = (elapsedMs / progress) * 100;
    const remainingMs = totalEstimatedMs - elapsedMs;

    if (remainingMs > 1000) {
      const seconds = Math.ceil(remainingMs / 1000);
      if (seconds > 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimeLeft(`Est: ${mins}m ${secs}s`);
      } else {
        setTimeLeft(`Est: ${seconds}s left`);
      }
    } else {
      setTimeLeft("Finalizing...");
    }
  }, [progress, startTime]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* 🎬 Immersive Video Background (Subtle & High Quality) */}
      <div className="absolute inset-0 z-0">
         <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="h-full w-full object-cover opacity-60 scale-105 blur-[3px]"
         >
            <source src="/clean-loading.mp4" type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[1200px] px-6 py-20 min-h-screen">
         
         {/* Top Branding (Centered & Minimal) */}
         <div className="mb-auto flex flex-col items-center gap-4 animate-fade-in">
            <Logo className="h-12 w-12" />
            <h1 className="text-sm font-bold tracking-[0.4em] uppercase opacity-40">CleanClip Neural</h1>
         </div>

         {/* Center Progress Module (Clean Focus) */}
         <div className="my-auto flex flex-col items-center text-center">
            
            <div className="relative mb-12 flex h-64 w-64 md:h-80 md:w-80 items-center justify-center">
                {/* Minimal Radial Loader */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                   <circle 
                      cx="50%" cy="50%" r="48%" 
                      stroke="rgba(255,255,255,0.08)" 
                      strokeWidth="2" 
                      fill="none" 
                   />
                   <circle 
                      cx="50%" cy="50%" r="48%" 
                      stroke="white" 
                      strokeWidth="3" 
                      fill="none"
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - progress}
                      className="transition-all duration-[1500ms] ease-out shadow-lg"
                      pathLength="100"
                      strokeLinecap="round"
                   />
                </svg>
                
                {/* Big Immersive Percentage */}
                <div className="flex flex-col items-center">
                   <span className="text-[120px] font-black tracking-[-0.05em] leading-none tabular-nums animate-fade-in">
                      {Math.round(progress)}
                   </span>
                   <span className="text-xl font-bold tracking-[0.2em] opacity-30 mt-[-10px]">%</span>
                </div>
            </div>

            <div className="space-y-4 animate-fade-in delay-200">
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Removing Background...</h2>
               <div className="flex items-center justify-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[15px] font-medium tracking-wide text-white/50">{displayStep}</span>
               </div>
               <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25">{timeLeft}</p>
            </div>
         </div>

         {/* Bottom Upsell Area (Paid Plan Promotion) */}
         <div className="mt-auto pt-16 w-full max-w-lg animate-fade-in-up delay-500">
            <div className="flex flex-col items-center gap-6 p-8 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl">
               <div className="text-center">
                  <p className="text-sm font-bold text-white/70 mb-1">Want it 5x faster?</p>
                  <p className="text-xs font-medium text-white/30 px-4">Upgrade to a Pro plan for priority neural processing and high-precision exports.</p>
               </div>
               <button 
                  onClick={() => onUpgrade?.()}
                  className="h-12 w-full max-w-[280px] rounded-full bg-white text-black font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl cursor-pointer"
               >
                  Upgrade Plans
               </button>
            </div>
         </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </section>
  );
}
