interface PaywallModalProps {
  onChoosePlan: (plan: "pro" | "lifetime") => void;
  onClose: () => void;
  loadingPlan: string | null;
}

export default function PaywallModal({ onChoosePlan, onClose, loadingPlan }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[36px] border border-black/6 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Upgrade Required</p>
        <h2 className="m-0 text-[32px] font-semibold tracking-[-0.05em] text-zinc-950 leading-tight">
          You&apos;ve used your credits
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-zinc-500">
          Upgrade to keep removing backgrounds with zero limitations.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => onChoosePlan("pro")}
            disabled={loadingPlan !== null}
            className="w-full cursor-pointer rounded-[24px] bg-zinc-950 px-6 py-5 text-left text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-lg font-bold">Pro - Best Value</span>
                <span className="text-xs text-white/50 uppercase tracking-widest font-bold">50 videos / month</span>
              </div>
              <span className="text-base font-bold text-white/90">{loadingPlan === "pro" ? "..." : "₹149"}</span>
            </div>
          </button>
          
          <button
            onClick={() => onChoosePlan("lifetime")}
            disabled={loadingPlan !== null}
            className="w-full cursor-pointer rounded-[24px] border border-black/8 bg-zinc-50 px-6 py-5 text-left text-zinc-950 transition-colors hover:bg-white disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-lg font-bold text-zinc-950">Lifetime Special</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Unlimited forever</span>
              </div>
              <span className="text-base font-bold text-zinc-900">{loadingPlan === "lifetime" ? "..." : "₹999"}</span>
            </div>
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 w-full text-center text-[13px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
