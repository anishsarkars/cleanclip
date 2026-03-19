"use client";

interface PaywallModalProps {
  onUpgrade: (plan: string) => void;
  onClose: () => void;
}

export default function PaywallModal({ onUpgrade, onClose }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-[40px] p-8 md:p-12 max-w-md w-full shadow-2xl border border-white/20 animate-slide-in text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400 group-hover:text-gray-900 transition-colors">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-gray-900 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight">
          Credits Exhausted
        </h2>
        <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-10 px-4">
          You&apos;ve reached your limit. Upgrade now for high-speed processing, HD quality, and zero watermarks.
        </p>

        {/* Upgrade Options */}
        <div className="flex flex-col gap-4 mb-10">
          {/* Monthly */}
          <button
            onClick={() => onUpgrade("monthly")}
            suppressHydrationWarning
            className="group flex items-center justify-between p-6 rounded-3xl bg-gray-900 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="text-left">
              <div className="font-black text-[15px]">Monthly Pro</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">50 videos · HD · 24/7 Support</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black">₹199</div>
              <div className="text-[10px] text-gray-500 font-black uppercase">/mo</div>
            </div>
          </button>

          {/* Yearly */}
          <button
            onClick={() => onUpgrade("yearly")}
            suppressHydrationWarning
            className="group flex items-center justify-between p-6 rounded-3xl bg-white border-2 border-gray-100 hover:border-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="text-left">
              <div className="font-black text-[15px] text-gray-900">Yearly Plan</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Save 37% · Yearly Access</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-gray-900">₹1,499</div>
              <div className="text-[10px] text-gray-400 font-black uppercase">/yr</div>
            </div>
          </button>
        </div>

        <p className="text-[11px] font-bold text-gray-400 m-0 uppercase tracking-widest">
          Credits refill automatically next month
        </p>
      </div>
    </div>
  );
}

