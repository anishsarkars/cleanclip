"use client";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    label: "FOR CASUAL USERS",
    desc: "10 videos every month. Perfect for hobbyists.",
    price: "₹0",
    period: "/mo",
    cta: "Current Plan",
    features: [
      "10 videos/month",
      "Up to 480p resolution",
      "30 sec length limit",
      "Standard watermark",
      "Standard processing speed",
    ],
    dark: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    label: "MOST POPULAR",
    desc: "Higher quality, no watermark. Great for creators.",
    price: "₹199",
    period: "/mo",
    cta: "Upgrade to Monthly",
    badge: "🔥 BEST VALUE",
    badgeStyle: "bg-gray-900 text-white",
    features: [
      "50 videos/month",
      "Up to 720p HD resolution",
      "120 sec length limit",
      "No Watermark",
      "Faster processing speed",
    ],
    dark: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    label: "FOR PROFESSIONALS",
    desc: "Best value. Save 37% with annual access.",
    price: "₹1,499",
    period: "/yr",
    cta: "Get Yearly Access",
    badge: "SAVING 37%",
    badgeStyle: "bg-green-500 text-white",
    features: [
      "50 videos/month",
      "Up to 720p HD resolution",
      "120 sec length limit",
      "Zero Watermark",
      "Priority processing speed",
    ],
    dark: false,
  },
];

interface PricingSectionProps {
  onUpgrade?: (planId: string) => void;
}

export default function PricingSection({ onUpgrade }: PricingSectionProps) {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgradeClick = async (id: string) => {
    if (id === "free" || !onUpgrade) return;
    setUpgrading(id);
    try {
      await onUpgrade(id);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-gray-50/50">
      <div className="section-container">
        
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">
            Simple Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 m-0">
            Choose your plan
          </h2>
          <p className="text-[15px] text-gray-500 mt-4 max-w-lg mx-auto font-medium">
            Every user gets up to 10 free credits every month (3 as guest). Refills automatically. High quality renders for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col p-8 rounded-[40px] border transition-all duration-300 ${
                p.dark 
                ? "bg-gray-900 border-gray-800 text-white shadow-2xl shadow-gray-900/20 scale-105 z-10" 
                : "bg-white border-gray-100 text-gray-900 shadow-xl shadow-gray-200/50 hover:border-gray-300"
              }`}
            >
              {/* Badge */}
              <div className="h-8 mb-4">
                {p.badge && (
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${p.badgeStyle}`}>
                    {p.badge}
                  </span>
                )}
              </div>

              <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-1 ${p.dark ? "text-gray-500" : "text-gray-400"}`}>
                {p.label}
              </p>
              <h3 className="text-3xl font-black m-0 mb-2">
                {p.name}
              </h3>
              <p className={`text-[13px] font-medium leading-relaxed mb-8 ${p.dark ? "text-gray-400" : "text-gray-500"}`}>
                {p.desc}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black tracking-tight">{p.price}</span>
                <span className={`text-sm font-bold ${p.dark ? "text-gray-600" : "text-gray-300"}`}>{p.period}</span>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-4 mb-10 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={p.dark ? "text-white" : "text-gray-900"}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span className={`text-[14px] font-medium ${p.dark ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgradeClick(p.id)}
                disabled={upgrading === p.id || p.id === "free"}
                suppressHydrationWarning
                className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                  p.dark 
                  ? "bg-white text-gray-900 hover:bg-gray-100 shadow-lg" 
                  : "bg-gray-50 text-gray-900 border border-gray-100 hover:bg-white hover:border-gray-900"
                } ${upgrading && upgrading !== p.id ? "opacity-50" : "opacity-100"}`}
              >
                {upgrading === p.id ? "Connecting..." : p.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-12 font-medium">
          Prices include GST. Monthly credits reset exactly 30 days after your first use.
        </p>

      </div>
    </section>
  );
}

