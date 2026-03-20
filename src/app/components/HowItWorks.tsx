"use client";

const STEPS = [
  {
    title: "Upload",
    description: "Drop in a video or GIF and start processing instantly.",
  },
  {
    title: "Process",
    description: "CleanClip removes the background frame by frame.",
  },
  {
    title: "Export",
    description: "Preview the result and download a transparent WebM.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-20 text-center animate-fade-in">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40">
            How it works
          </p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-2">
            Three simple steps
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="glass-aero rounded-[40px] p-10 border-white/20 transition-transform duration-500 hover:-translate-y-2 group">
              <div className="mb-10 text-xs font-bold uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">
                Step 0{index + 1}
              </div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight text-white">{step.title}</h3>
              <p className="m-0 text-lg leading-relaxed text-white/60 font-medium">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
