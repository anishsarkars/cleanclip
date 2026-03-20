interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
  previewUrl?: string | null;
  startTime?: string | null; // Added to calculate ETA
}

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  // Simple step text for display
  const displayStep = step?.split(" (")[0] || "AI Neural Engine Active...";

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24 overflow-hidden">
      {/* Background Animated Blobs - Premium feel */}
      <div className="absolute top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-50/50 mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-50/50 mix-blend-multiply blur-3xl delay-700" />

      <div className="relative z-10 w-full max-w-lg rounded-[48px] border border-black/6 bg-white/90 p-16 text-center shadow-[0_20px_120px_rgba(0,0,0,0.06)] backdrop-blur-2xl animate-fade-in transition-all duration-1000">
        <div className="flex flex-col items-center">
          
          {/* Pro Minimal Pulsing Icon */}
          <div className="relative mb-12 flex h-24 w-24 items-center justify-center">
             <div className="absolute inset-0 animate-ping rounded-full bg-black/5" />
             <div className="absolute inset-4 animate-pulse rounded-full bg-black/10" />
             <div className="relative h-12 w-12 rounded-full border-[3px] border-zinc-100 border-t-zinc-950 animate-spin" />
             <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] border-2 border-white" />
          </div>
          
          <div className="space-y-3 mb-12">
             <h2 className="text-4xl font-semibold tracking-[-0.06em] text-zinc-950">
                Removing Background
             </h2>
             <p className="mx-auto max-w-xs truncate text-[14px] font-medium text-zinc-400">
                Current file: <span className="text-zinc-600">{fileName}</span>
             </p>
          </div>

          <div className="flex flex-col items-center gap-4 py-8 px-12 border border-black/[0.03] bg-black/[0.01] rounded-[32px] w-full max-w-sm">
             <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                <span className="text-[17px] font-bold tracking-tight text-zinc-800">{displayStep}</span>
             </div>
             
             {/* Sub-status (Drift/ETA or simple timer) */}
             <div className="flex items-center gap-1.5 opacity-40">
                <div className="h-1 w-1 rounded-full bg-zinc-950 animate-bounce" />
                <div className="h-1 w-1 rounded-full bg-zinc-950 animate-bounce delay-100" />
                <div className="h-1 w-1 rounded-full bg-zinc-950 animate-bounce delay-200" />
             </div>
          </div>

          <div className="mt-16 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 pointer-events-none select-none">
             Neural Engine 4.0 Pro
          </div>
        </div>
      </div>
    </section>
  );
}
