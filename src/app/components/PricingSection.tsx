import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Currency = "INR" | "USD";

const PLANS = [
  {
    id: "free",
    name: "FREE - Forever",
    price: { INR: "₹0", USD: "$0" },
    cadence: "/month",
    description: "Use Cleanclip for free.",
    features: [
      "10 videos / month",
      "Standard processing",
      "No Watermark",
      "Standard quality",
      "Basic editing tools"
    ],
    cta: "Start Free",
    featured: false,
    badge: null
  },
  {
    id: "pro",
    name: "PRO - Best Value",
    price: { INR: "₹149", USD: "$1.49" },
    regularPrice: { INR: "₹199", USD: "$2.49" },
    cadence: "/month",
    description: "Built for power creators and professional output.",
    features: [
      "50 videos / month",
      "Priority processing ⚡",
      "No watermark",
      "High quality",
      "Extra editing tools",
      "Faster queue",
      "Dedicated support"
    ],
    cta: "Upgrade to Pro",
    featured: true,
    badge: "Most Popular"
  },
  {
    id: "lifetime",
    name: "LIFETIME - Special",
    price: { INR: "₹999", USD: "$11.99" },
    laterPrice: { INR: "₹1999+", USD: "$24.99+" },
    cadence: "one-time",
    description: "Pay once, remove backgrounds forever.",
    features: [
      "Unlimited / Month",
      "Priority processing",
      "No watermark",
      "Dedicated support",
      "All Pro features",
      "And more..."
    ],
    cta: "Get Lifetime Deal",
    featured: false,
    badge: "Best Deal!"
  },
] as const;

interface PricingSectionProps {
  onUpgrade: (plan: "free" | "pro" | "lifetime") => void;
}

export default function PricingSection({ onUpgrade }: PricingSectionProps) {
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
    <section id="pricing" className="bg-white py-24 md:py-32">
      <div className="section-container">
        <div className="mb-14 text-center animate-fade-in">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-10">
            Simple plans, <span className="text-zinc-400">no surprises.</span>
          </h2>

          {/* 🔘 Sleek Currency Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-[13px] font-bold tracking-tight transition-opacity ${currency === "INR" ? "opacity-100" : "opacity-30"}`}>INR (₹)</span>
            <button 
              onClick={() => setCurrency(prev => prev === "INR" ? "USD" : "INR")}
              className="relative h-8 w-16 rounded-full bg-zinc-100 border border-black/5 p-1 flex items-center shadow-inner"
            >
              <div className={`h-6 w-6 rounded-full bg-zinc-950 shadow-md transition-transform duration-500 transform ${currency === "USD" ? "translate-x-8" : "translate-x-0"}`} />
            </button>
            <span className={`text-[13px] font-bold tracking-tight transition-opacity ${currency === "USD" ? "opacity-100" : "opacity-30"}`}>USD ($)</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[40px] p-10 flex flex-col transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.05)] group ${plan.featured
                ? "bg-zinc-950 text-white shadow-2xl scale-[1.02]"
                : "bg-white border border-black/5 text-zinc-950 hover:bg-zinc-50/50"
                }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.featured ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"} px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] shadow-lg border border-white/10`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>
                <p className={`text-[14px] font-medium mb-10 leading-relaxed ${plan.featured ? "text-white/60" : "text-zinc-500"}`}>{plan.description}</p>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">{plan.price[currency]}</span>
                  <span className={`text-lg font-bold ${plan.featured ? "text-white/30" : "text-zinc-300"}`}>{plan.cadence}</span>
                </div>
                {plan.id === "pro" && plan.regularPrice && (
                  <p className="mt-2 text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                    Launch Offer <span className="line-through opacity-40 ml-1">(Regular: {plan.regularPrice[currency]})</span>
                  </p>
                )}
                {plan.id === "lifetime" && plan.laterPrice && (
                  <p className="mt-2 text-[12px] font-bold text-amber-500 uppercase tracking-widest">LIMITED TIME <span className="line-through opacity-40 ml-1">(Later: {plan.laterPrice[currency]})</span></p>
                )}
              </div>

              <div className="mb-14 space-y-5 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className={`flex items-center gap-4 text-[15px] font-bold ${plan.featured ? "text-white/80" : "text-zinc-600"}`}>
                    <CheckCircle2 className={`w-5 h-5 ${plan.featured ? "text-blue-400" : "text-blue-500"}`} strokeWidth={3} />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onUpgrade(plan.id)}
                suppressHydrationWarning
                className={`w-full h-14 rounded-full text-base font-bold transition-all active:scale-95 ${plan.featured
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_12px_40px_rgba(37,99,235,0.2)]"
                  : plan.id === "lifetime"
                    ? "bg-zinc-950 text-white hover:bg-black shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                    : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
