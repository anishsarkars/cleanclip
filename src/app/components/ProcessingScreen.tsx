interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
  startTime?: string | null; // Added to calculate ETA
}

export default function ProcessingScreen({ fileName, progress, step, previewUrl, startTime }: ProcessingScreenProps) {
  // Extract remaining frames from step string like "Removing background 10/100 (90 remaining)"
  const remainingMatch = step?.match(/\((.*?) remaining\)/);
  const remaining = remainingMatch ? remainingMatch[1] : null;
  
  // Extract current frame for a fast-ticking effect
  const frameMatch = step?.match(/background (\d+)\//);
  const currentFrame = frameMatch ? frameMatch[1] : null;

  // Clean step text for display
  const displayStep = step?.split(" (")[0] || "Initializing...";

  // Calculate ETA
  let etaText = "Calculating ETA...";
  if (startTime && progress > 5) {
     const start = new Date(startTime).getTime();
     const now = Date.now();
     const elapsed = now - start;
     // simple ETA: total_time_estimate = elapsed / progress_fraction
     // remaining = total_time_estimate - elapsed
     const totalEstimate = (elapsed / progress) * 100;
     const remainingMs = Math.max(0, totalEstimate - elapsed);
     
     if (remainingMs > 0) {
        const seconds = Math.floor(remainingMs / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
           etaText = `About ${mins}m ${secs}s left`;
        } else {
           etaText = `About ${secs}s left`;
        }
     }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24 overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-50/50 mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-50/50 mix-blend-multiply blur-3xl delay-700" />

      <div className="relative z-10 w-full max-w-xl rounded-[40px] border border-black/6 bg-white/80 p-12 text-center shadow-[0_20px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-fade-in transition-all duration-700">
        <div className="flex flex-col items-center">
          
          <div className="mb-2">
             <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Processing Engine</p>
          </div>
          
          <h2 className="text-4xl font-semibold tracking-[-0.05em] text-zinc-950 mb-1">
             AI Cleaning
          </h2>
          <p className="mx-auto max-w-xs truncate text-[13px] font-medium text-zinc-400 mb-8">{fileName}</p>

          {/* Live Preview Window */}
          <div className="relative mb-10 w-full overflow-hidden rounded-[32px] border border-black/8 bg-zinc-50 shadow-inner group">
            <div className="checker aspect-video w-full flex items-center justify-center relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Live preview" 
                  className="h-full w-full object-contain animate-fade-in"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                   <div className="animate-spin h-6 w-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Awaiting stream...</p>
                </div>
              )}
            </div>
            
            {/* Live Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
               <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-white tracking-[0.1em] opacity-80">Live Engine</span>
            </div>

            {/* Frame Counter - Ultra Minimal */}
            {currentFrame && (
               <div className="absolute bottom-6 left-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  REF <span className="text-zinc-900 tabular-nums">{currentFrame}</span>
               </div>
            )}
          </div>

          {/* Minimal Status Indicators */}
          <div className="w-full max-w-sm space-y-10">
            {/* Step & ETAs */}
            <div className="flex flex-col items-center gap-1.5">
               <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[15px] font-semibold tracking-tight text-zinc-900">{displayStep}</span>
               </div>
               <p className="text-[13px] font-medium text-zinc-400">
                  {etaText}
               </p>
            </div>

            {/* Circular Progress (Minimal replacement for loading bar) */}
            <div className="relative h-24 w-24 flex items-center justify-center">
               <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none" stroke="currentColor"
                    className="text-zinc-50"
                    strokeWidth="4"
                  />
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none" stroke="currentColor"
                    className="text-zinc-950 transition-all duration-300 ease-linear"
                    strokeWidth="4"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * progress) / 100}
                    strokeLinecap="round"
                  />
               </svg>
               <span className="absolute text-xl font-bold tracking-tighter text-zinc-950 tabular-nums">
                  {Math.floor(progress)}%
               </span>
            </div>
          </div>

          <div className="mt-12 opacity-30">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-950">
               NEURAL PROCESSING ACTIVE
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
