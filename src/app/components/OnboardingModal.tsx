interface OnboardingModalProps {
  onSelect: (plan: "free" | "monthly" | "yearly") => void;
  loadingPlan: string | null;
}

const OPTIONS = [
  { id: "free", name: "Free", price: "₹0", description: "10 monthly credits to get started." },
  { id: "monthly", name: "Monthly", price: "₹199", description: "50 monthly credits for regular use." },
  { id: "yearly", name: "Yearly", price: "₹1,499", description: "50 monthly credits with the best long-term value." },
] as const;

export default function OnboardingModal({ onSelect, loadingPlan }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-4xl rounded-[36px] border border-black/6 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.12)] md:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Onboarding</p>
        <h2 className="m-0 text-[34px] font-semibold tracking-[-0.05em] text-zinc-950 md:text-[44px]">
          Choose your plan to continue
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-zinc-500">
          Select a plan before using CleanClip. You can upgrade any time.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={loadingPlan !== null}
              className="cursor-pointer rounded-[28px] border border-black/6 bg-zinc-50 p-7 text-left transition-colors hover:border-zinc-950 hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              <div className="mb-8 flex items-end justify-between">
                <h3 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">{option.name}</h3>
                <span className="text-sm font-medium text-zinc-400">{option.price}</span>
              </div>
              <p className="m-0 text-sm leading-7 text-zinc-500">
                {loadingPlan === option.id ? "Updating plan..." : option.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
