"use client";

export default function PromoBanner() {
  return (
    <div className="relative z-[100] w-full bg-black/95 text-white/50 border-b border-white/5 py-1.5 px-6 flex items-center justify-center animate-fade-in transition-all">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-[0.1em]">
        <span className="opacity-80 whitespace-nowrap">launch day - Need free credits or query?</span>
        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com/in/anishsarkar-"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
          >
            <span className="h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)] animate-pulse" />
            <span className="opacity-90 group-hover:opacity-100">DM LinkedIn</span>
          </a>
          <span className="h-2 w-[1px] bg-white/10" />
          <a
            href="https://cal.com/anishsarkar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
          >
            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="opacity-90 group-hover:opacity-100">Book Call</span>
          </a>
        </div>
      </div>
    </div>
  );
}
