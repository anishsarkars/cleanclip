"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ChevronDown, Crown, Star, Menu, X } from "lucide-react";
import Logo from "./Logo";
import Link from "next/link";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import RecentsMenu from "./RecentsMenu";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  helperText?: string | null;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "image/gif", "video/webm"];

export default function HeroSection({ onFileSelected, helperText }: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const validate = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return "Use MP4, MOV, GIF, or WebM.";

    const limitMB = 100;
    const limitBytes = limitMB * 1024 * 1024;

    if (file.size > limitBytes) return `Maximum file size is ${limitMB}MB for your current plan.`;
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const nextError = validate(file);
      setError(nextError);
      if (!nextError) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <section
      className="relative flex flex-col items-center justify-start overflow-hidden bg-black text-white w-full rounded-b-[48px] md:rounded-b-[80px] shadow-2xl"
      style={{ fontFamily: "'General Sans', sans-serif" }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
      />

      {/* 50% Black Overlay */}
      <div className="absolute inset-0 h-full bg-black/50 z-10 pointer-events-none" />

      {/* Navbar Content */}
      <nav className="relative z-20 flex w-full items-center justify-between px-6 md:px-[120px] py-6 md:py-[40px]">
        {/* Left Side: CleanClip Logo restored */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Logo className="h-10 w-10 text-white group-hover:scale-105 transition-transform" color="white" />
          <span className="font-bold tracking-tighter text-[22px] md:text-[24px] group-hover:opacity-80 transition-opacity">CleanClip</span>
        </div>

        <div className="flex items-center gap-6 md:gap-10">
          {/* Main Links */}
          <div className="hidden md:flex items-center space-x-[30px]">
            <a href="#how-it-works" className="cursor-pointer group">
              <span className="text-[14px] font-medium text-white/50 hover:text-white transition-colors">How it Works</span>
            </a>

          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:block">
                   <RecentsMenu theme="dark" />
                </div>
                

                
                <UserButton />
              </>
            ) : (
              <button onClick={() => openSignIn()} className="text-[14px] font-bold text-white/50 hover:text-white transition-colors">Login</button>
            )}

            {/* Hamburger Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Over Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 animate-fade-in lg:hidden">
           <div className="p-6 md:px-12 py-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo className="h-10 w-10 text-white" color="white" />
                <span className="font-bold tracking-tighter text-[22px]">CleanClip</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
           
           <div className="flex flex-col items-center justify-center gap-10 mt-20">
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[32px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all no-underline"
              >
                How it Works
              </a>

              <div className="flex items-center gap-6 mt-10">
                 {user ? <RecentsMenu theme="dark" /> : <button onClick={() => { openSignIn(); setMobileMenuOpen(false); }} className="text-[18px] font-bold text-white">Login</button>}
              </div>
           </div>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-20 flex w-full flex-col items-center pt-[60px] md:pt-[90px] pb-[60px] md:pb-[120px] px-4 md:px-6">
        <div className="flex flex-col items-center gap-[24px] md:gap-[40px] w-full">

          {/* Heading restored to original CleanClip phrasing */}
          <h1
            className="max-w-[800px] text-center text-[36px] sm:text-[44px] md:text-[64px] font-medium leading-[1.1] tracking-tight animate-fade-in delay-100"
            style={{
              background: "linear-gradient(144.5deg, #ffffff 28%, rgba(0,0,0,0) 115%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent"
            }}
          >
            Remove video background in seconds.
          </h1>

          {/* Subtitle restored */}
          <p className="max-w-[500px] text-center text-[16px] md:text-[20px] font-normal leading-relaxed text-white/70 animate-fade-in delay-200 mt-0 md:mt-[-16px]">
            Clean your video or gif backgrounds with AI.
          </p>

        </div>

        {/* ------------------------------------------------------------- 
             Functional Upload Component
             ------------------------------------------------------------- */}
        <div className="w-full max-w-[780px] mt-16 animate-fade-in delay-300 relative z-30">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group min-h-[280px] md:min-h-[400px] cursor-pointer flex flex-col items-center justify-center bg-white/5 backdrop-blur-[120px] rounded-[48px] border-[1.5px] transition-all duration-700 hover:scale-[1.01] shadow-[0_80px_160px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] py-12 md:py-16 px-6 md:px-8 ${isDragging ? "border-white bg-white/20" : "border-white/10 hover:border-white/40"
              }`}
          >
            <div className="mb-10 md:mb-12 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center bg-white/5 rounded-[32px] border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1} />
            </div>

            <h2 className="mb-3 text-[28px] md:text-[36px] font-bold text-white shadow-text text-center">
              Drag & Drop to upload
            </h2>
            <p className="text-white/80 font-medium text-[16px] md:text-[18px]">
              or <span className="underline decoration-white/40 underline-offset-4 hover:opacity-100 transition-all">browse files</span>
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,image/gif,video/webm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />

            <p className="mt-10 md:mt-14 text-white/50 text-[10px] md:text-[12px] font-bold uppercase tracking-[0.3em]">
              MP4, MOV, GIF (MAX. 100MB)
            </p>
          </div>

          {error && (
            <div className="animate-fade-in mt-6 rounded-[24px] border border-red-500/30 bg-black/60 backdrop-blur-md p-4 text-center text-[14px] font-medium text-red-400 max-w-[500px] mx-auto">
              {error}
            </div>
          )}
          {helperText && !error && (
            <div className="animate-fade-in mt-8 text-[12px] font-bold text-white/40 uppercase tracking-[0.2em] text-center">
              {helperText}
            </div>
          )}
        </div>
      </div>

    </section>
  );
}

