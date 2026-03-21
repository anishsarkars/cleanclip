"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Logo from "./Logo";
import { Crown, Star } from "lucide-react";
import RecentsMenu from "./RecentsMenu";

interface NavbarProps {
  userPlan?: string;
}

export default function Navbar({ userPlan }: NavbarProps) {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) return null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-8 md:py-12 animate-fade-in text-white">
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <Logo className="h-10 w-10 group-hover:scale-110 transition-transform duration-500" />
        <span className="font-bold tracking-tighter text-[22px] md:text-[24px]">CleanClip</span>
      </Link>

      <div className="hidden lg:flex gap-10 text-[14px] font-black uppercase tracking-[0.2em] text-white/40">
        <Link href="#how-it-works" className="hover:text-white transition-colors no-underline">Works</Link>
        <Link href="#pricing" className="hover:text-white transition-colors no-underline">Pricing</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <RecentsMenu />
            {(userPlan === "pro" || userPlan === "lifetime") && (
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest shadow-lg ${
                userPlan === "lifetime" 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                  : "bg-blue-500/10 border-blue-500/30 text-blue-500"
              }`}>
                {userPlan === "lifetime" ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                {userPlan}
              </div>
            )}
            <UserButton />
          </>
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
