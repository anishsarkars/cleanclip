"use client";

import { useEffect, useState, useRef } from "react";
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
  const [driftProgress, setDriftProgress] = useState(progress);
  const displayStep = step?.split(" (")[0] || "AI Neural Engine Active...";
  
  // High quality drift to ensure "constant moving"
  useEffect(() => {
    setDriftProgress(prev => {
      // If the incoming progress is significantly ahead, jump to it
      if (progress > prev) return progress;
      return prev;
    });
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDriftProgress(prev => {
         // Only drift if we are in the active processing phase (above 5% and below 98%)
         if (prev >= 5 && prev < 98) {
            // Tiny increment to keep the UI "alive" between backend updates
            return prev + 0.05; 
         }
         return prev;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!startTime || progress <= 5) {
      setTimeLeft("Calculating...");
      return;
    }

    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedMs = now - start;
    
    if (elapsedMs <= 0) return;

    // Estimate based on the driftProgress for smoother label updates too
    const totalEstimatedMs = (elapsedMs / Math.max(progress, 1)) * 100;
    const remainingMs = totalEstimatedMs - elapsedMs;

    if (remainingMs > 1000) {
      const seconds = Math.ceil(remainingMs / 1000);
      if (seconds > 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimeLeft(`${mins}m ${secs}s remaining`);
      } else {
        setTimeLeft(`${seconds}s remaining`);
      }
    } else if (progress > 95) {
      setTimeLeft("Finalizing...");
    } else {
      setTimeLeft("Calculating...");
    }
  }, [progress, startTime]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black font-sans">
      {/* 🎬 Ultra-Clean Cinematic Background Animation (Full Screen) */}
      <div className="absolute inset-0 z-0">
         <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="h-full w-full object-cover opacity-60 scale-105"
         >
            <source src="/processing-bg.mp4" type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
         <div className="absolute inset-0 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-screen py-24 px-6 w-full max-w-5xl">
         
         {/* Top: Simple Logo Only (Clean UI) */}
         <div className="animate-fade-in">
            <Logo className="h-16 w-16 opacity-80" />
         </div>

         {/* Center: Immersive Radial Neural Hub */}
         <div className="flex flex-col items-center">
            <div className="relative mb-8 flex items-center justify-center h-72 w-72 md:h-96 md:w-96">
                {/* Immersive neural glow */}
                <div 
                   className="absolute inset-0 rounded-full border-[1px] border-white/5 shadow-[0_0_100px_rgba(255,255,255,0.05)] scale-110" 
                />
                
                <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                   <circle 
                      cx="50%" cy="50%" r="46%" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="1" 
                      fill="none" 
                   />
                   <circle 
                      cx="50%" cy="50%" r="46%" 
                      stroke="white" 
                      strokeWidth="4" 
                      fill="none"
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - driftProgress}
                      className="transition-all duration-300 ease-linear"
                      pathLength="100"
                      strokeLinecap="round"
                   />
                </svg>

                <div className="absolute flex flex-col items-center gap-0">
                   <span className="text-[80px] md:text-[110px] font-black tracking-[-0.08em] text-white leading-none tabular-nums">
                      {Math.floor(driftProgress)}<span className="text-2xl font-bold opacity-30 ml-1">%</span>
                   </span>
                   <span className="text-[12px] font-bold tracking-[0.5em] uppercase text-white/30 transform translate-y-2">{timeLeft}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 animate-fade-in">
               <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">{displayStep}</span>
               </div>
               <p className="text-[13px] font-medium text-white/20 tracking-tight">Processing: {fileName}</p>
            </div>
         </div>

         {/* Bottom: Subtle Subscription Upgrade */}
         <div className="flex flex-col items-center gap-8 animate-fade-in delay-500">
            <button 
              onClick={onUpgrade}
              className="group flex items-center gap-3 py-3 px-8 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 active:scale-95"
            >
               <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors">Upgrade to Pro</span>
               <div className="flex items-center justify-center h-5 w-5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                  <span className="text-white text-[10px] font-bold">↑</span>
               </div>
               <span className="text-[10px] font-medium text-white/20 pl-2">Get 10x faster performance</span>
            </button>
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/10">Neural Engine 4.0 Pro</span>
         </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </section>
  );
}
