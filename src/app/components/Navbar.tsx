"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user } = useUser();
  const { openSignIn, openSignUp } = useClerk();

  return (
    <nav className="w-full h-24 flex items-center justify-between px-12 md:px-20">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold rotate-[-12deg] group-hover:rotate-0 transition-transform">
           C
        </div>
        <Link href="/" className="text-[14px] font-bold uppercase tracking-[0.2em] text-zinc-950 no-underline">
          CleanClip
        </Link>
      </div>

      <div className="hidden items-center gap-10 md:flex">
        <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-950/80 no-underline hover:text-zinc-950">
          Home
        </Link>
        <Link href="#pricing" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 no-underline hover:text-zinc-950 transition-colors">
          Pricing
        </Link>
        <Link href="#how-it-works" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 no-underline hover:text-zinc-950 transition-colors">
          About
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openSignIn()}
              className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-950 transition-colors px-4"
            >
              Login
            </button>
            <button
              onClick={() => openSignUp()}
              className="cursor-pointer h-10 w-10 flex items-center justify-center bg-zinc-950 rounded-full text-white shadow-lg shadow-black/10 hover:bg-black transition-all"
            >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
