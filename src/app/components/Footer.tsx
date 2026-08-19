"use client";

import Logo from "./Logo";

export default function Footer() {
  return (
    <div className="flex flex-col w-full bg-white">
      <footer className="py-20 border-t border-black/5 text-zinc-400">
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

          </div>
        </div>
      </footer>
    </div>
  );
}
