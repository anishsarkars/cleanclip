"use client";

import { CheckCircle2 } from "lucide-react";

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
    <section id="pricing" className="bg-white py-24 md:py-32">
      <div className="section-container">
        <div className="mb-20 text-center animate-fade-in">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
             Simple plans, <span className="text-zinc-400">no surprises.</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[40px] p-10 flex flex-col transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.05)] group ${
                plan.featured
                  ? "bg-zinc-950 text-white shadow-2xl scale-[1.02]"
                  : "bg-white border border-black/5 text-zinc-950 hover:bg-zinc-50/50"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-zinc-950 px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg border border-black/5">
                   Popular Choice
                </div>
              )}

              <div className="mb-10">
                 <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>
                 <p className={`text-base font-medium mb-10 leading-relaxed ${plan.featured ? "text-white/60" : "text-zinc-500"}`}>{plan.description}</p>
                 
                 <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                   <span className={`text-lg font-bold ${plan.featured ? "text-white/30" : "text-zinc-300"}`}>{plan.cadence}</span>
                 </div>
              </div>

              <div className="mb-14 space-y-6 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className={`flex items-center gap-4 text-[16px] font-bold ${plan.featured ? "text-white/80" : "text-zinc-600"}`}>
                    <CheckCircle2 className={`w-5 h-5 ${plan.featured ? "text-blue-400" : "text-blue-500"}`} strokeWidth={3} />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onUpgrade(plan.id)}
                suppressHydrationWarning
                className={`w-full h-14 rounded-full text-base font-bold transition-all active:scale-95 ${
                  plan.featured
                    ? "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_12px_40px_rgba(255,255,255,0.1)]"
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
