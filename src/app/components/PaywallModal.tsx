interface PaywallModalProps {
  onChoosePlan: (plan: "monthly" | "yearly") => void;
  onClose: () => void;
  loadingPlan: string | null;
}

export default function PaywallModal({ onChoosePlan, onClose, loadingPlan }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[36px] border border-black/6 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Upgrade</p>
        <h2 className="m-0 text-[32px] font-semibold tracking-[-0.05em] text-zinc-950">
          You&apos;ve used your credits
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-zinc-500">
          Choose a paid plan to keep exporting transparent videos.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => onChoosePlan("monthly")}
            disabled={loadingPlan !== null}
            className="w-full cursor-pointer rounded-[24px] bg-zinc-950 px-6 py-4 text-left text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Monthly</span>
              <span className="text-sm text-white/70">{loadingPlan === "monthly" ? "Loading..." : "₹199"}</span>
            </div>
          </button>
          <button
            onClick={() => onChoosePlan("yearly")}
            disabled={loadingPlan !== null}
            className="w-full cursor-pointer rounded-[24px] border border-black/8 bg-zinc-50 px-6 py-4 text-left text-zinc-950 transition-colors hover:bg-white disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Yearly</span>
              <span className="text-sm text-zinc-400">{loadingPlan === "yearly" ? "Loading..." : "₹1,499"}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
