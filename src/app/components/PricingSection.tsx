const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    cadence: "/month",
    description: "10 videos each month for logged-in users.",
    features: ["10 monthly credits", "Transparent WebM export", "Standard processing"],
    featured: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹199",
    cadence: "/month",
    description: "For regular creators who need more output.",
    features: ["50 monthly credits", "Priority processing", "Production-friendly exports"],
    featured: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹1,499",
    cadence: "/year",
    description: "Best value for long-term use.",
    features: ["50 monthly credits", "Lower annual cost", "Priority processing"],
    featured: false,
  },
] as const;

interface PricingSectionProps {
  onUpgrade: (plan: "free" | "monthly" | "yearly") => void;
}

export default function PricingSection({ onUpgrade }: PricingSectionProps) {
  return (
    <section id="pricing" className="bg-[#fafafa] py-24 md:py-32">
      <div className="section-container">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Pricing
          </p>
          <h2 className="m-0 text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[48px]">
            Simple plans, no surprises
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[30px] border p-8 ${
                plan.featured
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-black/6 bg-white text-zinc-950"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="m-0 text-2xl font-semibold tracking-[-0.04em]">{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80">
                    Popular
                  </span>
                )}
              </div>

              <div className="mb-4 flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-[-0.06em]">{plan.price}</span>
                <span className={`pb-2 text-sm ${plan.featured ? "text-white/60" : "text-zinc-400"}`}>
                  {plan.cadence}
                </span>
              </div>

              <p className={`mb-8 text-[15px] leading-7 ${plan.featured ? "text-white/72" : "text-zinc-500"}`}>
                {plan.description}
              </p>

              <div className="mb-10 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className={`text-sm ${plan.featured ? "text-white/80" : "text-zinc-600"}`}>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onUpgrade(plan.id)}
                suppressHydrationWarning
                className={`w-full cursor-pointer rounded-full px-5 py-3.5 text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-white text-zinc-950 hover:bg-zinc-100"
                    : "bg-zinc-950 text-white hover:bg-black"
                }`}
              >
                {plan.id === "free" ? "Start Free" : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
