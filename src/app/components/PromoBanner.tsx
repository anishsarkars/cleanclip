"use client";

export default function PromoBanner() {
  return (
    <div className="relative z-[100] w-full bg-black text-white/70 backdrop-blur-xl border-b border-white/5 py-1.5 px-6 flex items-center justify-center transition-all duration-300">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em]">
        <span className="opacity-80">Want free credits or have a query?</span>
        <div className="flex items-center gap-3">
          <a 
            href="https://linkedin.com/in/anishsarkar-" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors flex items-center gap-1.5"
          >
            <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
            DM on LinkedIn
          </a>
          <span className="h-3 w-[1px] bg-white/10" />
          <a 
            href="https://cal.com/anishsarkar/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
            Book a call
          </a>
        </div>
      </div>
    </div>
  );
}
