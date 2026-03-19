"use client";

import { useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OnboardingModalProps {
  token: string;
  onPaymentStart: (plan: string) => void;
  onSuccess: (plan: string, credits: number) => void;
}

export default function OnboardingModal({ token, onPaymentStart, onSuccess }: OnboardingModalProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = useMemo(
    () => [
      {
        id: "free",
        name: "Free",
        desc: "10 videos / month",
        price: "₹0",
        meta: "480p SD · Watermark",
        primary: false,
      },
      {
        id: "monthly",
        name: "Monthly",
        desc: "50 videos / month",
        price: "₹199",
        meta: "720p HD · No watermark",
        primary: true,
      },
      {
        id: "yearly",
        name: "Yearly",
        desc: "Best value overall",
        price: "₹1,499",
        meta: "HD Pro · No watermark",
        primary: false,
      },
    ],
    []
  );

  const selectFree = async () => {
    setError(null);
    setBusy("free");
    try {
      const res = await fetch(`${API}/auth/select-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: "free" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || data?.message || "Could not activate Free plan");

      const plan = data.plan ?? "free";
      const credits = data.credits ?? data.remaining_credits ?? 10;
      onSuccess(plan, credits);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not activate Free plan";
      setError(`${msg}. Activating local free plan...`);
      setTimeout(() => onSuccess("free", 10), 1500);
    } finally {
      setBusy(null);
    }
  };

  const startPaid = async (planId: "monthly" | "yearly") => {
    setError(null);
    setBusy(planId);
    try {
      await onPaymentStart(planId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start payment";
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative z-10 bg-white rounded-[48px] p-8 md:p-12 max-w-4xl w-full shadow-2xl border border-white/20 animate-slide-in">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">One last step</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Ready to create magic?
            </h2>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-md m-0">
              Select a plan to activate your account. You can change your preference at any time from your profile.
            </p>
          </div>

          <div className="w-16 h-16 bg-gray-900 rounded-[24px] flex items-center justify-center shrink-0 shadow-xl shadow-gray-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7l3-7z" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const disabled = busy !== null;
            const isBusy = busy === p.id;

            const onClick = () => {
              if (disabled) return;
              if (p.id === "free") selectFree();
              else startPaid(p.id as "monthly" | "yearly");
            };

            return (
              <button
                key={p.id}
                onClick={onClick}
                disabled={disabled}
                suppressHydrationWarning
                className={`flex flex-col text-left p-8 rounded-[36px] transition-all relative overflow-hidden group cursor-pointer ${
                  p.primary 
                  ? "bg-gray-900 text-white shadow-2xl shadow-gray-900/20 active:scale-[0.98]" 
                  : "bg-gray-50 text-gray-900 border border-gray-100 hover:border-gray-900 active:scale-[0.98]"
                } ${disabled && !isBusy ? "opacity-50 grayscale" : "opacity-100"}`}
              >
                {isBusy && (
                  <div className="absolute inset-0 bg-inherit flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-black uppercase tracking-widest">{p.name}</span>
                  {p.primary && <span className="text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-tighter">Recommended</span>}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black">{p.price}</span>
                  <span className={`text-[11px] font-bold ${p.primary ? "text-gray-400" : "text-gray-400"}`}>/month</span>
                </div>

                <p className={`text-[13px] font-bold mb-8 ${p.primary ? "text-gray-400" : "text-gray-500"}`}>{p.desc}</p>
                
                <div className={`mt-auto text-[11px] font-black uppercase tracking-widest ${p.primary ? "text-white/60" : "text-gray-400"}`}>
                  {p.meta}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold animate-fade-in text-center shadow-sm">
            {error}
          </div>
        )}

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8 opacity-60">
          <p className="text-[12px] font-medium text-gray-400 m-0">Secure payments by DodoPayments</p>
          <div className="flex gap-4">
             <div className="w-8 h-5 bg-gray-100 rounded-md" />
             <div className="w-8 h-5 bg-gray-100 rounded-md" />
             <div className="w-8 h-5 bg-gray-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}


