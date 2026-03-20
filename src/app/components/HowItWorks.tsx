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
    <section id="how-it-works" className="bg-white py-24 md:py-32">
      <div className="section-container">
        <div className="mb-20 text-center animate-fade-in">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Three simple steps
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[32px] border border-black/5 bg-zinc-50/50 p-10 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:scale-[1.02]">
              <div className="mb-10 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                0{index + 1}
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-zinc-950">{step.title}</h3>
              <p className="m-0 text-[16px] leading-[1.8] text-zinc-500 font-medium">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
