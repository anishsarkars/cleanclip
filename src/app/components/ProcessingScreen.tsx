"use client";

import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import { ArrowRight } from "lucide-react";

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
         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
         <div className="absolute inset-0 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-between py-24 px-6 md:py-32">
        
        {/* 🏷️ Minimal Branding (Spacious) */}
        <div className="animate-fade-in opacity-80 hover:opacity-100 transition-opacity">
          <Logo className="h-14 w-14" color="#FFFFFF" />
        </div>

        {/* 🌀 High-Quality 'Doodle' Neural Progress Hub */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative h-64 w-64 md:h-80 md:w-80 flex items-center justify-center">
            
            {/* Animated 'Doodle' Pulse Rings (Spacious Feel) */}
            <div className="absolute inset-[-40px] rounded-full border border-white/5 animate-[ping_4s_linear_infinite]" />
            <div className="absolute inset-[-100px] rounded-full border border-white/[0.02] animate-[ping_6s_linear_infinite] delay-1000" />
            
            <svg className="h-full w-full rotate-[-90deg] drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="1"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray="289%"
                strokeDashoffset={`${289 * (1 - driftProgress / 100)}%`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Neural Percentage (Subtle Doodle Vib) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-6xl md:text-8xl font-light tracking-tighter tabular-nums animate-pulse-subtle">
                {Math.floor(driftProgress)}
                <span className="text-2xl md:text-3xl opacity-30 font-thin ml-1">%</span>
              </span>
              <span className="mt-4 text-[10px] uppercase tracking-[0.5em] font-black text-white/30 animate-pulse">
                Removing...
              </span>
            </div>
          </div>
          
          <div className="mt-20 text-center space-y-3">
            <p className="text-xs font-medium text-white/40 tracking-[0.2em] uppercase">
              {displayStep || "Initializing Neural Matrix"}
            </p>
            {progress > 5 && (
              <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em] delay-500 animate-fade-in">
                {timeLeft}
              </p>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.85; }
        }
        .animate-fade-in { animation: fade-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
