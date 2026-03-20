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
  
  // Clean step text for display
  const displayStep = step?.split(" (")[0] || "Initializing...";

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24">
      <div className="w-full max-w-xl rounded-[32px] border border-black/6 bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] animate-fade-in transition-all duration-500">
        <div className="flex flex-col items-center">
          {/* Animated spinner */}
          <div className="relative mb-8 h-10 w-10 cursor-wait">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-zinc-100 border-t-zinc-950" />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Processing</p>
          <h2 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
            Cleaning your video
          </h2>
          <p className="mb-8 truncate text-sm text-zinc-500">{fileName}</p>

          {/* Live Preview Window */}
          <div className="relative mb-10 w-full overflow-hidden rounded-[24px] border border-black/8 bg-zinc-50 shadow-inner">
            <div className="checker aspect-video w-full flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Live preview" 
                  className="h-full w-full object-contain animate-pulse"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                   <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />
                   <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">Waiting for first frame...</p>
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2">
               <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">Live Preview</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div className="mb-4 h-[6px] overflow-hidden rounded-full bg-zinc-100">
              <div 
                className="h-full rounded-full bg-zinc-950 transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            {/* Frame / Step info */}
            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2 font-medium text-zinc-600">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {displayStep}
              </span>
              <span className="font-bold text-zinc-950">{progress}%</span>
            </div>

            {remaining && (
              <div className="mt-8 rounded-2xl bg-zinc-50 py-3 px-4 text-xs font-medium text-zinc-500 border border-black/[0.03]">
                 <span className="text-zinc-950 font-bold">{remaining}</span> frames remaining
              </div>
            )}
          </div>

          <div className="mt-12 text-[11px] font-medium leading-relaxed text-zinc-400 uppercase tracking-widest">
            Our AI model is removing the background frame-by-frame
          </div>
        </div>
      </div>
    </section>
  );
}
