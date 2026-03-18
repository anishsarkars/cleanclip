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



export default function Navbar({ onAuthClick, userInfo, onLogout }: NavbarProps) {
  const { openSignIn, openSignUp } = useClerk();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 60,
      background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid #f3f4f6" : "none",
      transition: "all 0.25s ease",
    }}>
      <div className="section-container" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" id="nav-logo" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "#111827", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4c0-1.1.9-2 2-2h10l4 4v10c0 1.1-.9 2-2 2h-6"/>
              <path d="M14 2v4h4"/>
              <path d="M8 18l-4-4 4-4"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em", color: "#111827" }}>
            Clean<span style={{ color: "#9ca3af" }}>clip</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {[{ l: "How it works", h: "#how-it-works" }, { l: "Pricing", h: "#pricing" }].map(({ l, h }) => (
            <a key={l} href={h} style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#111827")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               {/* 🎯 CREDIT DISPLAY (TOP BAR UI) */}
               {userInfo && (
                 <a 
                   href="#pricing"
                   style={{ 
                     display: "flex", alignItems: "center", gap: 6,
                     background: "#f3f4f6", padding: "6px 12px", 
                     borderRadius: 50, color: "#111827", 
                     fontSize: 12, fontWeight: 800, textDecoration: "none",
                     border: "1px solid #e5e7eb", transition: "all 0.2s"
                   }}
                 >
                   ⚡ {userInfo.credits} {userInfo.plan === "free" ? "/ 15 credits" : "videos left"}
                 </a>
               )}
              <UserButton />
            </div>
          ) : (
            <>
              <button
                onClick={() => openSignIn()}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  padding: "8px 0",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                }}
              >
                Log in
              </button>
              <button
                onClick={() => openSignUp()}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#111827",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 50,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Sign up
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}


