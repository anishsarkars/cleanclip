interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
}

export default function ProcessingScreen({ fileName, progress, step, previewUrl }: ProcessingScreenProps) {
  // Extract remaining frames from step string like "Removing background 10/100 (90 remaining)"
  const remainingMatch = step?.match(/\((.*?) remaining\)/);
  const remaining = remainingMatch ? remainingMatch[1] : null;
  
  // Extract current frame for a fast-ticking effect
  const frameMatch = step?.match(/background (\d+)\//);
  const currentFrame = frameMatch ? frameMatch[1] : null;

  // Clean step text for display
  const displayStep = step?.split(" (")[0] || "Initializing...";

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24 overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-50/50 mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-50/50 mix-blend-multiply blur-3xl delay-700" />

      <div className="relative z-10 w-full max-w-xl rounded-[32px] border border-black/6 bg-white/80 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl animate-fade-in transition-all duration-500">
        <div className="flex flex-col items-center">
          {/* Pulsing AI Indicator */}
          <div className="relative mb-8 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-zinc-950/5" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-zinc-950/10" />
            <div className="relative h-10 w-10 overflow-hidden">
               <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-zinc-100 border-t-zinc-950" />
            </div>
          </div>

          <div className="space-y-1">
             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">AI Engine Active</p>
             <h2 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
               Removing Background
             </h2>
             <p className="mx-auto max-w-xs truncate text-sm font-medium text-zinc-500 opacity-60">{fileName}</p>
          </div>

          {/* Live Preview Window */}
          <div className="relative mt-8 mb-10 w-full overflow-hidden rounded-[24px] border border-black/8 bg-zinc-50 shadow-inner group">
            <div className="checker aspect-video w-full flex items-center justify-center relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Live preview" 
                  className="h-full w-full object-contain animate-fade-in"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                   <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-300" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 delay-100" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 delay-200" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Analyzing first frames...</p>
                </div>
              )}
            </div>
            
            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
               <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">LIVE PREVIEW</span>
            </div>

            {/* Frame Counter Badge */}
            {currentFrame && (
               <div className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-white/10">
                  Frame <span className="text-emerald-400 tabular-nums">{currentFrame}</span>
               </div>
            )}
          </div>

          {/* Progress bar container */}
          <div className="w-full max-w-sm space-y-4">
            <div className="relative h-2 overflow-hidden rounded-full bg-zinc-100 shadow-inner">
              <div 
                className="h-full rounded-full bg-zinc-950 transition-all duration-300 ease-linear" 
                style={{ width: `${progress}%` }} 
              />
              {/* Shimmer effect on progress */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {/* Status indicators */}
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 font-medium text-zinc-600">
                <span className="flex h-2 w-2 items-center justify-center">
                   <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/50" />
                   <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="animate-pulse">{displayStep}</span>
              </div>
              <span className="font-bold text-zinc-950 tabular-nums">{Math.floor(progress)}%</span>
            </div>

            {remaining && (
              <div className="mt-4 rounded-xl bg-emerald-50/50 py-3 px-4 text-xs font-semibold text-emerald-700 border border-emerald-100/50 animate-bounce-subtle">
                 🚀 AI is working: <span className="text-emerald-900">{remaining}</span> frames left to clean
              </div>
            )}
          </div>

          <div className="mt-12 group cursor-help">
            <p className="text-[10px] font-bold leading-relaxed text-zinc-400 uppercase tracking-widest transition-colors group-hover:text-zinc-600">
               Powering through frame by frame using our latest neural model
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
