"use client";
import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "image/gif", "video/webm"];

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return "Unsupported format. Use MP4, MOV, or GIF.";
    if (file.size > 100 * 1024 * 1024) return "File too large. Max 100MB.";
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const err = validate(file);
    if (err) { setError(err); return; }
    onFileSelected(file);
  }, [onFileSelected]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <section id="upload" className="px-8 pb-20">
      <div className="max-w-2xl mx-auto">
        <div
          id="upload-zone"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-black bg-gray-50"
              : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,image/gif,video/webm"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden"
            id="file-input"
          />

          <div className="flex flex-col items-center py-14 px-8">
            {/* Upload icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
              isDragging ? "bg-black" : "bg-gray-100"
            }`}>
              <svg
                width="22" height="22" viewBox="0 0 24 24" fill="none"
                className={isDragging ? "stroke-white" : "stroke-gray-500"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>

            <p className="text-base font-semibold text-black mb-1">
              {isDragging ? "Drop it here" : "Drop your video here"}
            </p>
            <p className="text-sm text-gray-400 mb-6">or click to browse files</p>

            <button
              id="browse-btn"
              className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full pointer-events-none hover:bg-gray-800 transition-colors"
            >
              Choose File
            </button>

            {/* Constraints */}
            <div className="flex items-center gap-5 mt-6">
              {[
                { icon: "📁", text: "Max 100MB" },
                { icon: "⏱", text: "Max 2 min" },
                { icon: "🎬", text: "720p max" },
              ].map(({ icon, text }) => (
                <span key={text} className="text-xs text-gray-400 flex items-center gap-1">
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Format pills */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {["MP4", "MOV", "GIF", "WebM"].map((f) => (
            <span key={f} className="px-3 py-1 text-[11px] font-semibold text-gray-400 border border-gray-100 rounded-full bg-gray-50 tracking-wide">
              {f}
            </span>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div id="upload-error" className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
