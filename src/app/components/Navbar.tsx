"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Logo from "./Logo";
import { Crown, Star, Menu, X } from "lucide-react";
import RecentsMenu from "./RecentsMenu";
import { useState } from "react";

interface NavbarProps {
  theme?: "dark" | "light";
}

export default function Navbar({ theme = "dark" }: NavbarProps) {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isLoaded) return null;

  return (
    <nav className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-[120px] py-6 md:py-[40px] animate-fade-in ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <Logo className="h-10 w-10 group-hover:scale-110 transition-transform duration-500" color={theme === "light" ? "black" : "white"} />
        <span className="font-bold tracking-tighter text-[22px] md:text-[24px]">CleanClip</span>
      </Link>

      <div className={`hidden lg:flex gap-10 text-[14px] font-black uppercase tracking-[0.2em] ${theme === "light" ? "text-black/40" : "text-white/40"}`}>
        <Link href="#how-it-works" className={`transition-colors no-underline ${theme === "light" ? "hover:text-black" : "hover:text-white"}`}>How it Works</Link>

      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden sm:block">
              <RecentsMenu theme={theme} />
            </div>
            

            
            <UserButton />
          </>
        ) : (
          <button
            onClick={() => openSignIn()}
            suppressHydrationWarning
            className={`h-10 px-8 rounded-full text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${theme === "light" ? "bg-zinc-950 text-white" : "bg-white text-zinc-950"}`}
          >
            Login
          </button>
        )}
        
        {/* Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className={`lg:hidden p-2 transition-colors ${theme === "light" ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Slide-Over Overlay */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-[100] animate-fade-in lg:hidden ${theme === "light" ? "bg-white/95 text-zinc-950" : "bg-black/95 text-white"}`}>
           <div className="p-6 md:px-12 py-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo className="h-10 w-10" color={theme === "light" ? "black" : "white"} />
                <span className="font-bold tracking-tighter text-[22px]">CleanClip</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 transition-colors ${theme === "light" ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"}`}
              >
                <X className="w-6 h-6" />
              </button>
           </div>
           
           <div className="flex flex-col items-center justify-center gap-10 mt-20">
              <Link 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[32px] font-black uppercase tracking-[0.2em] transition-all no-underline ${theme === "light" ? "text-black/40 hover:text-black" : "text-white/50 hover:text-white"}`}
              >
                How it Works
              </Link>

              <div className="flex items-center gap-6 mt-10">
                 {user ? <RecentsMenu theme={theme} /> : <button onClick={() => { openSignIn(); setMobileMenuOpen(false); }} className={`text-[18px] font-bold ${theme === "light" ? "text-black" : "text-white"}`}>Login</button>}
              </div>
           </div>
        </div>
      )}
    </nav>
  );
}
