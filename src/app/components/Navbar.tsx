"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { Camera, Clapperboard } from "lucide-react";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="fixed inset-x-0 top-8 z-50 flex justify-center animate-fade-in pointer-events-none">
      <div className="h-14 glass-premium rounded-full flex items-center px-4 gap-2 border border-white/60 shadow-2xl pointer-events-auto">
        <Link href="/" className="flex items-center gap-1.5 px-3 border-r border-zinc-950/5 no-underline">
           <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-white" />
           </div>
           <span className="font-bold tracking-tighter text-zinc-900 text-lg">CC</span>
        </Link>
        <div className="hidden md:flex gap-8 px-8 text-sm font-semibold text-zinc-500">
           <Link href="/" className="hover:text-zinc-900 transition-colors no-underline">Home</Link>
           <a href="#" className="hover:text-zinc-900 transition-colors no-underline">Solutions</a>
           <a href="#pricing" className="hover:text-zinc-900 transition-colors no-underline">Pricing</a>
           <a href="#" className="hover:text-zinc-900 transition-colors no-underline">Contacts</a>
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-950/5">
           {user ? (
             <UserButton />
           ) : (
             <button 
               onClick={() => openSignIn()}
               className="h-10 px-6 rounded-full bg-zinc-950 text-white text-sm font-bold shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
             >
                Start Today
             </button>
           )}
        </div>
      </div>
    </nav>
  );
}
