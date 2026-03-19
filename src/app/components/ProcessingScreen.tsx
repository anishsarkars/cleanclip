"use client";

interface ProcessingScreenProps {
  fileName: string;
  progress: number;
  step?: string;
}

const DOTS = [0, 15, 35, 55, 75, 90];

export default function ProcessingScreen({ fileName, progress, step }: ProcessingScreenProps) {
  const eta = Math.max(0, Math.round(((100 - progress) / 100) * 90));

  return (
    <section className="min-h-screen bg-white flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-sm w-full text-center">

        {/* Spinning ring + icon */}
        <div className="relative w-20 h-20 mx-auto mb-10">
          <svg className="w-full h-full animate-spin text-gray-900" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="30" className="stroke-gray-100" strokeWidth="4"/>
            <path d="M36 6A30 30 0 0 1 66 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          AI is working...
        </h2>

        <p className="text-[13px] text-gray-400 font-medium mb-1 truncate px-4">
          {fileName}
        </p>

        <p className="text-[13px] text-gray-500 font-bold mb-8">
          {progress < 99 ? `~${eta}s remaining` : "Almost done..."}
        </p>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3 shadow-inner">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(0,0,0,0.1)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step + percent */}
        <div className="flex justify-between items-center mb-10">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[200px]">
            {step || "Processing..."}
          </span>
          <span className="text-[13px] font-black text-gray-900 leading-none">
            {progress}%
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {DOTS.map((threshold, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                progress >= threshold ? "bg-gray-900 w-8" : "bg-gray-100 w-2"
              }`}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4 text-left">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
               <circle cx="12" cy="12" r="10"/>
               <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed m-0">
            Processing depends on video length. Shorter videos are faster. Please don't close this tab.
          </p>
        </div>
      </div>
    </section>
  );
}

