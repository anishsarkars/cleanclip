"use client";

interface ResultSectionProps {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  onReset: () => void;
  onDownload: () => void;
}

export default function ResultSection({
  originalUrl,
  processedUrl,
  fileName,
  onReset,
  onDownload,
}: ResultSectionProps) {
  return (
    <section className="bg-white px-6 py-24">
      <div className="section-container">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Result</p>
            <h2 className="m-0 text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[48px]">
              Background removed
            </h2>
            <p className="mt-3 text-sm text-zinc-500">{fileName}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReset}
              className="cursor-pointer rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
            >
              Upload another
            </button>
            <button
              onClick={onDownload}
              className="cursor-pointer rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Download result
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/6 bg-zinc-50 p-4">
            <div className="mb-3 text-sm font-medium text-zinc-500">Original</div>
            <div className="overflow-hidden rounded-[20px] bg-black">
              <video src={originalUrl} autoPlay loop muted playsInline className="aspect-video w-full object-cover" />
            </div>
          </div>

          <div className="rounded-[28px] border border-black/6 bg-zinc-50 p-4">
            <div className="mb-3 text-sm font-medium text-zinc-500">Transparent result</div>
            <div className="checker overflow-hidden rounded-[20px] bg-white">
              <video src={processedUrl} autoPlay loop muted playsInline className="aspect-video w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
