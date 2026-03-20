"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="relative z-50 flex items-center justify-between px-12 pt-10 animate-fade-in text-white">
      <Link href="/" className="flex items-center gap-3 no-underline">
         <span className="font-bold tracking-tighter text-[28px]">CleanClip</span>
      </Link>
      
      <div className="hidden lg:flex gap-10 text-[14px] font-semibold opacity-70">
         <Link href="/" className="hover:opacity-100 transition-opacity no-underline">Product</Link>
         <Link href="/" className="hover:opacity-100 transition-opacity no-underline">Features</Link>
         <Link href="#pricing" className="hover:opacity-100 transition-opacity no-underline">Pricing</Link>
         <Link href="/" className="hover:opacity-100 transition-opacity no-underline">Support</Link>
      </div>

      <div className="flex items-center gap-4">
         {user ? (
           <UserButton />
         ) : (
           <button 
             onClick={() => openSignIn()}
             className="h-10 px-6 rounded-full bg-white text-zinc-800 text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
           >
              Login
           </button>
         )}
      </div>
    </nav>
  );
}
