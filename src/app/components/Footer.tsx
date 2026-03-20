"use client";

export default function Footer() {
  return (
    <footer className="py-20 bg-white/5 border-t border-white/10 text-white/40">
      <div className="mx-auto max-w-[1240px] px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-2">
           <div className="text-[28px] font-black tracking-tighter text-white">CleanClip</div>
           <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Neural Removal Engine 4.0 Pro</p>
        </div>
        <div className="text-sm font-medium tracking-tight max-w-[280px] md:text-right">
           Remove video backgrounds with a cleaner, faster workflow. Built with AI precision.
        </div>
      </div>
    </footer>
  );
}
