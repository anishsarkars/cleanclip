"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-8 md:py-12 animate-fade-in text-white">
      <Link href="/" className="flex items-center gap-2 no-underline group">
         <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
            <div className="h-4 w-4 bg-black rounded-sm" />
         </div>
         <span className="font-black tracking-tighter text-[22px] md:text-[24px]">CleanClip</span>
      </Link>
      
      <div className="hidden lg:flex gap-10 text-[14px] font-black uppercase tracking-[0.2em] text-white/40">
         <Link href="/" className="hover:text-white transition-colors no-underline">Product</Link>
         <Link href="/" className="hover:text-white transition-colors no-underline">Features</Link>
         <Link href="#pricing" className="hover:text-white transition-colors no-underline">Pricing</Link>
         <Link href="/" className="hover:text-white transition-colors no-underline">Support</Link>
      </div>

      <div className="flex items-center gap-4">
         {user ? (
           <UserButton />
         ) : (
           <button 
             onClick={() => openSignIn()}
             suppressHydrationWarning
             className="h-10 px-8 rounded-full bg-white text-zinc-950 text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
           >
              Login
           </button>
         )}
      </div>
    </nav>
  );
}
