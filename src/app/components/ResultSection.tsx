"use client";

import { useState } from "react";

interface ResultSectionProps {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  onReset: () => void;
  onDownload: () => void;
}

export default function ResultSection({
  originalUrl,
  processedUrl,
  fileName,
  onReset,
  onDownload,
}: ResultSectionProps) {
  const [bgColor, setBgColor] = useState("transparent");
  
  const PRESET_COLORS = [
    { name: "Transparent", value: "transparent", class: "bg-white checker border border-black/10" },
    { name: "White", value: "#FFFFFF", class: "bg-white border border-black/10" },
    { name: "Black", value: "#000000", class: "bg-black border border-white/10" },
    { name: "Green Screen", value: "#00FF00", class: "bg-[#00FF00] border border-black/10" },
    { name: "Blue Screen", value: "#0000FF", class: "bg-[#0000FF] border border-black/10" },
  ];
  return (
    <section className="bg-white px-6 py-24">
      <div className="section-container">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Result</p>
            <h2 className="m-0 text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[48px]">
              Background removed
            </h2>
            <p className="mt-3 text-sm text-zinc-500">{fileName}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReset}
              className="cursor-pointer rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
            >
              Upload another
            </button>
            <button
              onClick={onDownload}
              className="cursor-pointer rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Download result
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/6 bg-zinc-50 p-4">
            <div className="mb-3 text-sm font-medium text-zinc-500">Original</div>
            <div className="overflow-hidden rounded-[20px] bg-black">
              <video src={originalUrl} autoPlay loop muted playsInline className="aspect-video w-full object-cover" />
            </div>
          </div>

          <div className="rounded-[28px] border border-black/6 bg-zinc-50 p-4 flex flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-zinc-500">Transparent result</div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">BG Color:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-full shadow-sm border border-zinc-200">
                  {PRESET_COLORS.map((c) => (
                     <button
                       key={c.name}
                       onClick={() => setBgColor(c.value)}
                       title={c.name}
                       className={`w-6 h-6 rounded-full transition-transform ${c.class} ${bgColor === c.value ? "ring-2 ring-blue-500 ring-offset-2 scale-110" : "hover:scale-110"}`}
                     />
                  ))}
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 shadow-sm ml-1 group cursor-pointer hover:scale-110 transition-transform">
                    <input
                      type="color"
                      value={bgColor !== "transparent" ? bgColor : "#cccccc"}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute inset-[-10px] w-10 h-10 cursor-pointer opacity-0"
                      title="Custom Color"
                    />
                    <div 
                      className="w-full h-full pointer-events-none" 
                      style={{ background: bgColor === "transparent" ? "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" : bgColor }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`flex-1 overflow-hidden rounded-[20px] transition-colors duration-300 ${bgColor === "transparent" ? "checker bg-white" : ""}`}
              style={bgColor !== "transparent" ? { backgroundColor: bgColor } : {}}
            >
              <video src={processedUrl} autoPlay loop muted playsInline className="aspect-video w-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
