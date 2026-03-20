"use client";

import Link from "next/link";
import NavbarAuthClerk from "./NavbarAuthClerk";

export default function Navbar() {
  return (
    <div className="w-full flex justify-center sticky top-10 shrink-0">
      <nav className="glass-pill h-20 px-8 flex items-center justify-between w-full max-w-4xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-zinc-950 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
             <div className="h-4 w-4 rounded-full border-2 border-white/80" />
          </div>
          <span className="text-xl font-black tracking-[-0.06em] text-zinc-950 uppercase italic">CleanClip</span>
        </Link>

        {/* Center: Social/Links */}
        <div className="hidden md:flex items-center gap-10">
           <Link href="/" className="text-[14px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors">Home</Link>
           <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[14px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
           >
              Solutions
           </button>
           <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[14px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
           >
              Pricing
           </button>
           <Link href="/" className="text-[14px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors">Contacts</Link>
        </div>

        {/* Right: Auth + CTA */}
        <div className="flex items-center gap-6">
           <NavbarAuthClerk />
           <button 
              onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden lg:block h-12 px-8 bg-zinc-950 text-white text-[14px] font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
           >
             Start Today
           </button>
        </div>
      </nav>
    </div>
  );
}
