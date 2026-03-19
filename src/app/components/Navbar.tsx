"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

interface NavbarProps {
  onAuthClick?: (mode: "login" | "signup") => void;
  userInfo?: {
    email: string;
    credits: number;
    plan: string;
  } | null;
  onLogout?: () => void;
}

export default function Navbar({ userInfo }: NavbarProps) {
  const { openSignIn, openSignUp } = useClerk();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? "h-16 glass" : "h-20 bg-transparent"
    }`}>
      <div className="section-container h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4c0-1.1.9-2 2-2h10l4 4v10c0 1.1-.9 2-2 2h-6"/>
              <path d="M14 2v4h4"/>
              <path d="M8 18l-4-4 4-4"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Clean<span className="text-gray-400">clip</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[{ l: "How it works", h: "#how-it-works" }, { l: "Pricing", h: "#pricing" }].map(({ l, h }) => (
            <a key={l} href={h} className="text-[13px] text-gray-500 font-medium no-underline hover:text-gray-900 transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* Auth & Desktop Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
               {userInfo && (
                  <a 
                    href="#pricing"
                    className="hidden sm:flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full text-[11px] font-black text-gray-900 hover:bg-white transition-all shadow-sm"
                  >
                    <span className="opacity-70 text-[10px] leading-none mb-0.5">⚡</span> 
                    <span className="leading-none uppercase tracking-tight">{userInfo.credits} {userInfo.plan === "free" ? "/ 10" : "left"}</span>
                  </a>
               )}
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 shadow-sm" } }} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={() => openSignIn()} 
                suppressHydrationWarning
                className="text-[13px] font-medium text-gray-500 hover:text-gray-900 px-2 py-1 transition-colors cursor-pointer"
              >
                Log in
              </button>
              <button 
                onClick={() => openSignUp()} 
                suppressHydrationWarning
                className="text-[13px] font-bold bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-black transition-all shadow-lg shadow-gray-200 cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-gray-100 transition-colors z-[110]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`w-5 h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`w-5 h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 bg-white z-[105] md:hidden transition-all duration-500 ease-in-out ${
        mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          {[{ l: "How it works", h: "#how-it-works" }, { l: "Pricing", h: "#pricing" }].map(({ l, h }) => (
            <a key={l} href={h} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-900 no-underline">
              {l}
            </a>
          ))}
          {!user && (
            <div className="flex flex-col w-full gap-4 mt-8 max-w-xs">
              <button 
                onClick={() => { setMobileMenuOpen(false); openSignIn(); }} 
                suppressHydrationWarning
                className="w-full py-4 text-lg font-bold border border-gray-200 rounded-2xl text-gray-900"
              >
                Log in
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); openSignUp(); }} 
                suppressHydrationWarning
                className="w-full py-4 text-lg font-bold bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200"
              >
                Get Started
              </button>
            </div>
          )}
          {user && userInfo && (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl w-full max-w-xs text-center">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Your Credits</p>
              <p className="text-4xl font-black text-gray-900">{userInfo.credits}</p>
              <p className="text-xs text-gray-400 mt-2">Plan: <span className="text-gray-600 font-bold uppercase">{userInfo.plan}</span></p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}



