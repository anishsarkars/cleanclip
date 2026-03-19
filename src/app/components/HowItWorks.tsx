"use client";

const STEPS = [
  {
    n: "01", title: "Upload",
    desc: "Drag & drop or click. MP4, MOV, or GIF. Up to 100MB, 2 minutes.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  },
  {
    n: "02", title: "AI processes",
    desc: "Robust Video Matting removes the background frame by frame automatically.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  },
  {
    n: "03", title: "Preview",
    desc: "Drag slider to compare before & after. Pick transparent, color, or image background.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l-6-6 6-6M15 18l6-6-6-6"/></svg>,
  },
  {
    n: "04", title: "Download",
    desc: "Export transparent WebM. Drop into CapCut, Reels, Shorts, or any editor.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 md:py-32">
      <div className="section-container">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 m-0">
            Four steps.<br />
            <span className="text-gray-200">That simple.</span>
          </h2>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="card-premium group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                  {s.icon}
                </div>
                <span className="text-xs font-black text-gray-100 group-hover:text-gray-200 transition-colors uppercase tracking-widest">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed font-medium m-0">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 md:mt-20 flex justify-center lg:justify-start">
          <a
            href="#upload"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gray-900 text-white text-[15px] font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            Try it for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

