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
    <section id="pricing" className="py-32 bg-white/5 border-y border-white/10">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-20 text-center animate-fade-in">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40 shadow-subtext">
            Pricing
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.03em] text-white shadow-text">
             Simple plans, <span className="text-white/40">no surprises.</span>
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[48px] p-10 flex flex-col transition-all duration-700 hover:shadow-[0_48px_140px_rgba(0,0,0,0.15)] group ${
                plan.featured
                  ? "glass-aero border-white shadow-2xl bg-white/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-zinc-900 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl">
                   Most Popular
                </div>
              )}

              <div className="mb-10 lg:h-[220px]">
                 <h3 className="text-3xl font-bold tracking-tight text-white mb-2 shadow-text">{plan.name}</h3>
                 <p className="text-white/50 font-medium text-base mb-10 leading-relaxed shadow-subtext">{plan.description}</p>
                 
                 <div className="flex items-baseline gap-2 text-white shadow-text">
                   <span className="text-6xl font-black tracking-[-0.05em]">{plan.price}</span>
                   <span className="text-lg font-bold opacity-30">{plan.cadence}</span>
                 </div>
              </div>

              <div className="mb-14 space-y-6 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-4 text-[17px] font-bold text-white/70 shadow-subtext">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" strokeWidth={3} />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onUpgrade(plan.id)}
                className={`w-full h-16 rounded-[24px] text-lg font-bold transition-all active:scale-95 ${
                  plan.featured
                    ? "bg-white text-zinc-950 hover:scale-[1.02] shadow-[0_12px_40px_rgba(255,255,255,0.2)]"
                    : "bg-white/20 text-white hover:bg-white/30 border border-white/20"
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
