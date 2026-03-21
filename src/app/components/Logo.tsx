"use client";

import React from "react";
import Image from "next/image";

export default function Logo({ className = "h-8 w-8", color = "white" }: { className?: string; color?: string }) {
  // Using the exact source image for 100% brand fidelity as requested
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <Image 
        src={color === "black" ? "/1.png" : "/2.png"} 
        alt="CleanClip Logo" 
        width={512} 
        height={512} 
        className={`w-full h-full object-contain ${color === "black" ? "opacity-90 grayscale contrast-125" : "brightness-200"}`}
        priority
      />
    </div>
  );
}
