"use client";

import React from "react";

export default function Logo({ className = "h-8 w-8", color = "white" }: { className?: string; color?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded Outer Frame */}
      <rect 
        x="10" 
        y="10" 
        width="180" 
        height="180" 
        rx="54" 
        stroke={color} 
        strokeWidth="16"
      />
      
      {/* Top Left Diagonal Stripes */}
      <path 
        d="M50 20L15 55" 
        stroke={color} 
        strokeWidth="14" 
        strokeLinecap="round"
      />
      <path 
        d="M100 20L25 95" 
        stroke={color} 
        strokeWidth="14" 
        strokeLinecap="round"
      />
      <path 
        d="M150 20L35 135" 
        stroke={color} 
        strokeWidth="14" 
        strokeLinecap="round"
      />
      
      {/* Bottom Mountainous Shape with Sparkle */}
      <path 
        d="M20 180C20 180 50 120 100 120C150 120 180 180 180 180" 
        stroke={color} 
        strokeWidth="16" 
        strokeLinecap="round"
      />
      
      {/* Sparkle / Four-Pointed Star */}
      <path 
        d="M100 135L108 155L128 163L108 171L100 191L92 171L72 163L92 155Z" 
        fill={color}
      />
    </svg>
  );
}
