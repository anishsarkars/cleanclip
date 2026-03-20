interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
}

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24">
      <div className="w-full max-w-md rounded-[32px] border border-black/6 bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] animate-fade-in">
        {/* Animated spinner */}
        <div className="relative mx-auto mb-8 h-12 w-12 cursor-wait">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-zinc-100 border-t-zinc-950" />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Processing</p>
        <h2 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
          Cleaning your video
        </h2>
        <p className="mb-8 truncate text-sm text-zinc-500">{fileName}</p>

        {/* Progress bar */}
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
            {step || "Initializing..."}
          </span>
          <span className="font-bold text-zinc-950">{progress}%</span>
        </div>

        <div className="mt-10 text-[11px] font-medium leading-relaxed text-zinc-400 uppercase tracking-widest">
          AI is removing frames in real-time
        </div>
      </div>
    </section>
  );
}
