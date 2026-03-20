"use client";

import Link from "next/link";
import NavbarAuthClerk from "./NavbarAuthClerk";

export default function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between border-b border-black/5 bg-transparent animate-fade-in relative z-[100] mb-20 px-6">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-xl bg-zinc-950 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
             <div className="h-4 w-4 rounded-full border-2 border-white" />
          </div>
          <span className="text-xl font-bold tracking-[-0.08em] text-zinc-950 uppercase italic">CleanClip</span>
        </Link>

        {/* Desktop Links (from reference layout) */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 transition-colors">Home</Link>
          <button 
             onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
             className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
          >
             How it works
          </button>
          <button 
             onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
             className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
          >
             Pricing
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NavbarAuthClerk />
        
        {/* Minimal Search/Cart Icons (as decorations from reference) */}
        <div className="hidden lg:flex items-center gap-4 border-l border-black/5 pl-8 opacity-40">
           <svg className="h-5 w-5 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
           <div className="relative">
              <svg className="h-5 w-5 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-zinc-950 text-[6px] font-bold text-white flex items-center justify-center">1</span>
           </div>
        </div>
      </div>
    </nav>
  );
}
