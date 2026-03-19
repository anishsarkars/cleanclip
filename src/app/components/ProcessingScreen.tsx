interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
}

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24">
      <div className="w-full max-w-md rounded-[32px] border border-black/6 bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
        <div className="mx-auto mb-8 h-16 w-16 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Processing</p>
        <h2 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">Cleaning your video</h2>
        <p className="mb-8 truncate text-sm text-zinc-500">{fileName}</p>

        <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-zinc-950 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">{step || "Working..."}</span>
          <span className="font-medium text-zinc-950">{progress}%</span>
        </div>
      </div>
    </section>
  );
}
