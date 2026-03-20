"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-10 animate-fade-in text-white">
      <Link href="/" className="flex items-center gap-3 no-underline">
         <span className="font-extrabold tracking-tighter text-[26px]">CleanClip</span>
      </Link>
      
      <div className="hidden lg:flex gap-12 text-[15px] font-bold text-white/70">
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
