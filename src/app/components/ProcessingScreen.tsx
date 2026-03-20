"use client";

import { useEffect, useState, useMemo } from "react";
import Logo from "./Logo";

interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
  startTime?: string | null;
}

export default function ProcessingScreen({ fileName, progress, step, startTime }: ProcessingScreenProps) {
  const [timeLeft, setTimeLeft] = useState<string>("Calculating...");
  const displayStep = step?.split(" (")[0] || "AI Neural Engine Active...";

  useEffect(() => {
    if (!startTime || progress <= 5) {
      setTimeLeft("Calculating...");
      return;
    }

    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedMs = now - start;
    
    // Safety check for invalid dates or negative time
    if (elapsedMs <= 0) return;

    const totalEstimatedMs = (elapsedMs / progress) * 100;
    const remainingMs = totalEstimatedMs - elapsedMs;

    if (remainingMs > 0) {
      const seconds = Math.ceil(remainingMs / 1000);
      if (seconds > 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimeLeft(`${mins}m ${secs}s remaining`);
      } else {
        setTimeLeft(`${seconds}s remaining`);
      }
    } else {
      setTimeLeft("Finalizing...");
    }
  }, [progress, startTime]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* 🎬 High Quality Immersive Background Animation (Full Screen) */}
      <div className="absolute inset-0 z-0">
         <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="h-full w-full object-cover opacity-40 scale-110"
         >
            <source src="/loading-animation.mp4" type="video/mp4" />
         </video>
         {/* Atmospheric overlays to blend the video into the OLED black theme */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
         <div className="absolute inset-0 backdrop-blur-[20px]" />
      </div>

      {/* 🌫️ Ambient Cloud Depth Layer */}
      <div className="absolute inset-x-0 bottom-0 h-[600px] pointer-events-none z-0">
          <div className="absolute bottom-[-150px] left-[-20%] right-[-20%] h-full bg-white blur-[140px] rounded-full opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl w-full">
         
         {/* 💎 Elite Central Logo Branding */}
         <div className="mb-12 animate-fade-in">
            <Logo className="h-20 w-20 shadow-[0_0_50px_rgba(255,255,255,0.2)]" />
         </div>

         {/* 💿 High Quality Progress Indicator (Immersive) */}
         <div className="relative mb-16 flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute h-96 w-96 bg-white/5 blur-[100px] rounded-full animate-pulse" />
            
            {/* Progress Radial Layer */}
            <div className="relative flex items-center justify-center h-64 w-64 md:h-80 md:w-80">
                <svg className="h-full w-full -rotate-90">
                   <circle 
                      cx="50%" cy="50%" r="48%" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="2" 
                      fill="none" 
                   />
                   <circle 
                      cx="50%" cy="50%" r="48%" 
                      stroke="white" 
                      strokeWidth="4" 
                      fill="none"
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - progress}
                      className="transition-all duration-700 ease-out shadow-lg"
                      pathLength="100"
                      strokeLinecap="round"
                   />
                </svg>
                {/* Center Stats */}
                <div className="absolute flex flex-col items-center gap-1">
                   <span className="text-[64px] md:text-[88px] font-black tracking-tighter text-white animate-fade-in tabular-nums">
                      {Math.round(progress)}<span className="text-2xl opacity-40">%</span>
                   </span>
                   <span className="text-sm font-bold tracking-[0.4em] uppercase text-white/40">{timeLeft}</span>
                </div>
            </div>
         </div>

         {/* 📝 Status Module */}
         <div className="space-y-6 animate-fade-in delay-200">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                   Removing Background...
                </h2>
                <div className="flex items-center gap-3 py-2 px-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                   <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]" />
                   <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">{displayStep}</span>
                </div>
            </div>
            
            <p className="mx-auto max-w-md truncate text-sm font-medium text-white/30">
               Processing: <span className="text-white/60">{fileName}</span>
            </p>
         </div>

         {/* 🚀 Pro Tier Technical Label */}
         <div className="mt-24 flex items-center gap-4 opacity-20 group">
            <div className="h-[1px] w-12 bg-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white group-hover:tracking-[0.6em] transition-all">Neural Engine 4.0 Pro</span>
            <div className="h-[1px] w-12 bg-white" />
         </div>
      </div>

      <style jsx>{`
        .shadow-text { text-shadow: 0 0 40px rgba(255,255,255,0.1); }
      `}</style>
    </section>
  );
}
