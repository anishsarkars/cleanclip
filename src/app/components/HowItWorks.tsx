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
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            How it works
          </p>
          <h2 className="m-0 text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[48px]">
            Three simple steps
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[28px] border border-black/6 bg-zinc-50 p-8">
              <div className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                0{index + 1}
              </div>
              <h3 className="mb-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">{step.title}</h3>
              <p className="m-0 text-[15px] leading-7 text-zinc-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
