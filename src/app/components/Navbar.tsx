"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { Camera, Clapperboard } from "lucide-react";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="fixed inset-x-0 top-8 z-50 flex justify-center animate-fade-in pointer-events-none px-6">
      <div className="h-16 glass-card rounded-full flex items-center px-6 gap-2 border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.1)] pointer-events-auto bg-white/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-1.5 px-3 border-r border-zinc-950/10 no-underline mr-4">
           <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-white" strokeWidth={2.5} />
           </div>
           <span className="font-bold tracking-tighter text-zinc-900 text-xl hidden sm:block">CC</span>
        </Link>
        <div className="hidden md:flex gap-10 px-8 text-[15px] font-bold text-zinc-500">
           <Link href="/" className="hover:text-zinc-950 transition-colors no-underline">Home</Link>
           <a href="#" className="hover:text-zinc-950 transition-colors no-underline">Solutions</a>
           <a href="#pricing" className="hover:text-zinc-950 transition-colors no-underline">Pricing</a>
           <a href="#" className="hover:text-zinc-950 transition-colors no-underline">Contacts</a>
        </div>
        <div className="flex items-center gap-2 pl-4 border-l border-zinc-950/10 ml-4">
           {user ? (
             <UserButton />
           ) : (
             <button 
               onClick={() => openSignIn()}
               className="h-11 px-8 rounded-full bg-zinc-950 text-white text-[15px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:bg-black transition-all cursor-pointer active:scale-95"
             >
                Start Today
             </button>
           )}
        </div>
      </div>
    </nav>
  );
}
