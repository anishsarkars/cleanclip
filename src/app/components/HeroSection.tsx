"use client";

import { useCallback, useRef, useState } from "react";

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  helperText?: string | null;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "image/gif", "video/webm"];

export default function HeroSection({ onFileSelected, helperText }: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return "Use MP4, MOV, GIF, or WebM.";
    if (file.size > 100 * 1024 * 1024) return "Maximum file size is 100MB.";
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const nextError = validate(file);
      setError(nextError);
      if (!nextError) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <section
      id="upload"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] px-6 pb-20 pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 240px at 50% 78%, rgba(0,0,0,0.045), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full -translate-x-1/2 -translate-y-[58%] text-center text-[88px] font-[900] leading-none tracking-[-0.08em] text-black/[0.05] sm:text-[144px] md:text-[220px] lg:text-[320px]"
      >
        REMOVE
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[220px] w-[220px] -translate-x-1/2 translate-y-10 rounded-full bg-black/[0.04] blur-[90px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
        <h1 className="mb-4 max-w-[680px] text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[48px]">
          Remove video background in seconds
        </h1>

        {helperText && (
          <p className="mb-6 text-sm font-medium text-zinc-500">{helperText}</p>
        )}

        <div className="w-full max-w-[540px] rounded-[28px] border border-black/8 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-sm">
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
            className={`flex min-h-[400px] flex-col items-center justify-center rounded-[22px] border px-8 py-10 text-center transition-all duration-200 md:px-12 md:py-14 ${
              isDragging
                ? "border-black/20 bg-zinc-50"
                : "border-dashed border-black/12 bg-white"
            }`}
          >
            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/8 bg-zinc-50">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-zinc-900"
              >
                <path d="M12 16V7" strokeLinecap="round" />
                <path d="M8.5 10.5 12 7l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="4" width="16" height="16" rx="4" />
              </svg>
            </div>

            <h2 className="m-0 mb-3 text-[32px] font-black leading-[0.98] tracking-[-0.05em] text-zinc-950 md:text-[42px]">
              Drag & drop
              <br />
              <span className="text-zinc-400">videos or GIFs</span>
            </h2>

            <p className="mb-8 max-w-[320px] text-[15px] font-medium leading-6 text-zinc-500">
              or{" "}
              <button
                onClick={() => inputRef.current?.click()}
                suppressHydrationWarning
                className="cursor-pointer font-semibold text-zinc-950 underline decoration-black/15 underline-offset-4 hover:decoration-black"
              >
                browse files
              </button>{" "}
              on your device
            </p>

            <button
              onClick={() => inputRef.current?.click()}
              suppressHydrationWarning
              className="cursor-pointer rounded-full bg-zinc-950 px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-black active:scale-[0.98]"
            >
              Upload Video
            </button>

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
          </div>

          {error && (
            <div className="animate-fade-in mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
