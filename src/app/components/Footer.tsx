"use client";

import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="py-20 bg-white border-t border-black/5 text-zinc-400">
      <div className="section-container flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
               <Logo className="h-8 w-8" color="black" />
               <div className="text-[24px] font-bold tracking-tighter text-zinc-950">CleanClip</div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Neural Removal Engine 4.0 Pro</p>
        </div>
        <div className="flex flex-col gap-4 text-sm font-medium tracking-tight max-w-[320px] md:text-right md:items-end leading-relaxed">
           <p>Remove video backgrounds with a cleaner, faster workflow. Built with AI precision for high-output creators.</p>
           <p className="opacity-70 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
             Made with <span className="text-red-500 animate-pulse text-sm">❤</span> by <a href="https://aniish.me" target="_blank" rel="noopener noreferrer" className="text-zinc-950 tracking-tighter hover:underline hover:text-blue-500 transition-colors">Anish</a>
           </p>
        </div>
      </div>
    </footer>
  );
}
