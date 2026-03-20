"use client";

interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
  startTime?: string | null;
}

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  const displayStep = step?.split(" (")[0] || "AI Neural Engine Active...";

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      {/* 🌌 Synchronized Cinematic Background (OLED Black to Blue) */}
      <div className="absolute inset-0 bg-[#000000] -z-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/80 via-[#1E293B]/40 to-[#2563EB]/40 -z-20" />
      
      {/* ☁️ Soft Clouds (Base) */}
      <div className="absolute inset-x-0 bottom-0 h-[500px] pointer-events-none z-0">
          <div className="absolute bottom-[-150px] left-[-25%] right-[-25%] h-[400px] bg-white blur-[140px] rounded-full opacity-70 animate-cloud-drift" />
          <div className="absolute bottom-[-100px] left-[-15%] right-[-15%] h-[320px] bg-white blur-[120px] rounded-full opacity-50 animate-cloud-float-slow" />
          <div className="absolute bottom-[-200px] left-[-10%] right-[-10%] h-[500px] bg-white blur-[160px] rounded-full opacity-90" />
      </div>

      <div className="relative z-10 w-full max-w-[540px] rounded-[64px] border border-white/5 bg-white/[0.03] p-12 md:p-16 text-center shadow-[0_80px_160px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-[120px] animate-fade-in transition-all duration-1000">
        <div className="flex flex-col items-center">
          
          {/* Pro Cinematic Pulsing Loader */}
          <div className="relative mb-14 flex h-28 w-28 items-center justify-center">
             <div className="absolute inset-0 animate-ping rounded-full bg-white/5" />
             <div className="absolute inset-4 animate-pulse rounded-full bg-white/10" />
             <div className="relative h-14 w-14 rounded-full border-[3px] border-white/10 border-t-white animate-spin" />
             <div className="absolute top-0 right-0 h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-[#000000]" />
          </div>
          
          <div className="space-y-4 mb-14">
             <h2 className="text-4xl md:text-5xl font-black tracking-[-0.06em] text-white shadow-text leading-tight">
                Removing Background
             </h2>
             <p className="mx-auto max-w-[320px] truncate text-[16px] font-bold text-white/40 shadow-subtext">
                Processing: <span className="text-white/60">{fileName}</span>
             </p>
          </div>

          <div className="flex flex-col items-center gap-6 py-10 px-10 border border-white/[0.05] bg-white/[0.02] rounded-[40px] w-full">
             <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                   <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                   <span className="text-[18px] font-black tracking-tight text-white uppercase opacity-90">{displayStep}</span>
                </div>
                {/* Progress Number */}
                <span className="text-zinc-500 font-bold text-xs tracking-[0.2em]">{progress}% Complete</span>
             </div>
             
             {/* Dynamic Ambient Indicator */}
             <div className="flex items-center gap-2 opacity-30">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce delay-100" />
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce delay-200" />
             </div>
          </div>

          <div className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 pointer-events-none select-none">
             Neural Engine 4.0 Pro
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes cloud-drift {
          0% { transform: translateX(0) scale(1.1); }
          50% { transform: translateX(5%) scale(1.15); }
          100% { transform: translateX(0) scale(1.1); }
        }
        @keyframes cloud-float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
          100% { transform: translateY(0); }
        }
        .animate-cloud-drift { animation: cloud-drift 25s ease-in-out infinite; }
        .animate-cloud-float-slow { animation: cloud-float-slow 20s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
