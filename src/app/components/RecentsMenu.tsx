"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, Download, Trash2, X } from "lucide-react";

interface RecentItem {
  name: string;
  url: string;
  timestamp: number;
}

export default function RecentsMenu({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadRecents = () => {
    try {
      const recentsStr = localStorage.getItem("cleanclip_recents");
      let stored: RecentItem[] = recentsStr ? JSON.parse(recentsStr) : [];
      // Clean up older than 5 days
      const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const filtered = stored.filter(r => now - r.timestamp < fiveDaysMs);
      if (filtered.length !== stored.length) {
        localStorage.setItem("cleanclip_recents", JSON.stringify(filtered));
      }
      setRecents(filtered);
    } catch {
      setRecents([]);
    }
  };

  useEffect(() => {
    loadRecents();
    const handleUpdate = () => loadRecents();
    window.addEventListener("cleanclip_recents_updated", handleUpdate);
    return () => window.removeEventListener("cleanclip_recents_updated", handleUpdate);
  }, []);

  const clearRecents = () => {
    localStorage.removeItem("cleanclip_recents");
    setRecents([]);
    setIsOpen(false);
  };

  const handleDownload = (item: RecentItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name.replace(/\.[^.]+$/, "_cleanclip.webm");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (ts: number) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const daysDifference = Math.round((ts - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysDifference === 0) return "Today";
    return rtf.format(daysDifference, "day");
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
      }}
    >
      <button 
        className={`flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-[0.2em] font-black text-[14px] ${theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="w-4 h-4" />
        <span className="hidden md:inline">Recents</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-4 right-0 md:left-1/2 md:-translate-x-1/2 w-64 md:w-80 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white text-xs font-black uppercase tracking-widest opacity-80">Recent Files</h3>
            {recents.length > 0 && (
              <button onClick={clearRecents} className="text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {recents.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-xs font-medium">
                No recent files found. Next time you remove a background, it will appear here.
              </div>
            ) : (
              <div className="flex flex-col">
                {recents.map((item, idx) => (
                  <div key={idx} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 flex items-center justify-between group transition-colors">
                    <div className="flex flex-col gap-1 overflow-hidden pr-3">
                      <span className="text-white text-[13px] font-bold truncate opacity-90 block">{item.name}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">{formatTime(item.timestamp)}</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(item)}
                      className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                      title="Download again"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
