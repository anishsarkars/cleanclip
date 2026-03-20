"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import OnboardingModal from "./components/OnboardingModal";
import PaywallModal from "./components/PaywallModal";
import PricingSection from "./components/PricingSection";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultSection from "./components/ResultSection";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AppState = "idle" | "processing" | "result" | "error";
type Plan = "free" | "monthly" | "yearly";

interface UserInfo {
  clerk_user_id: string;
  email: string;
  plan: "none" | Plan;
  credits_remaining: number;
  last_reset_date: string;
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const { openSignUp } = useClerk();

  useEffect(() => {
    console.log("CleanClip Initialized. API URL:", API);
  }, []);

  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [jobStartTime, setJobStartTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [helperText, setHelperText] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncUser = useCallback(async () => {
    if (!user) {
      setUserInfo(null);
      return null;
    }

    const response = await fetch(`${API}/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Unable to sync user.");
    setUserInfo(data);
    return data as UserInfo;
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setUserInfo(null);
      return;
    }

    syncUser().catch((error) => {
      console.error(error);
      setHelperText("We could not load your account yet.");
    });
  }, [isLoaded, syncUser, user]);

  const creditLabel = useMemo(() => {
    if (userInfo) {
      if (userInfo.plan === "none") return "Choose a plan to continue";
      return `${userInfo.credits_remaining} credits remaining`;
    }
    return "3 guest exports available";
  }, [userInfo]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    stopPolling();
    setAppState("idle");
    setSelectedFile(null);
    setOriginalUrl("");
    setProcessedUrl("");
    setProgress(0);
    setStep("");
    setErrorMsg("");
  }, [stopPolling]);

  const pollStatus = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const response = await fetch(`${API}/status/${jobId}?t=${Date.now()}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Unable to fetch status.");
          
          if (data.created_at) setJobStartTime(data.created_at);
          const newProgress = data.progress ?? 0;
          setProgress((prev) => {
            if (newProgress > prev) return newProgress;
            if (prev < 95) return prev + 0.1;
            return prev;
          });
          
          setStep(data.step ?? "Processing");
          if (data.preview_frame) setPreviewUrl(data.preview_frame);

          if (data.status === "done") {
            stopPolling();
            setProgress(100);
            setStep("Ready!");
            
            setTimeout(async () => {
              if (data.result_url) setProcessedUrl(`${API}${data.result_url}`);
              if (user) await syncUser();
              setAppState("result");
            }, 800);
          }

          if (data.status === "error") {
            stopPolling();
            throw new Error(data.error || data.step || "Processing failed.");
          }
        } catch (error) {
          stopPolling();
          setErrorMsg(error instanceof Error ? error.message : "Processing failed.");
          setAppState("error");
        }
      }, 250);
    },
    [stopPolling, syncUser, user],
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (user && userInfo?.plan === "none") {
        setHelperText("Please select a plan to continue.");
        return;
      }

      setHelperText(null);
      setSelectedFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setAppState("processing");
      setStep("Initializing upload...");
      setProgress(0);

      try {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append("file", chunk);
          formData.append("job_id", jobId);
          formData.append("chunk_index", i.toString());

          setStep(`Uploading (${Math.round((i / totalChunks) * 100)}%)`);
          
          const response = await fetch(`${API}/upload-chunk`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Chunk upload failed.");
          }

          // Map 0-100% chunks to 0-30% on the global progress bar
          setProgress(Math.round(((i + 1) / totalChunks) * 30));
        }

        setStep("Finalizing stream...");
        const finalizeData = new FormData();
        finalizeData.append("job_id", jobId);
        finalizeData.append("filename", file.name);
        finalizeData.append("total_chunks", totalChunks.toString());
        if (user) finalizeData.append("clerk_user_id", user.id);
        
        const finalizeRes = await fetch(`${API}/finalize-upload`, {
          method: "POST",
          body: finalizeData,
        });

        if (!finalizeRes.ok) {
           const err = await finalizeRes.json();
           if (err.detail === "CREDITS_EXHAUSTED") {
             setShowPaywall(true); setAppState("idle"); return;
           }
           throw new Error(err.detail || "Finalization failed.");
        }

        setStep("Ready to process...");
        setProgress(30);
        pollStatus(jobId);

      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : "Initialization failed.");
        setAppState("error");
      }
    },
    [pollStatus, user, userInfo?.plan],
  );

  const handlePlanSelection = useCallback(
    async (plan: Plan) => {
      if (!user) {
        openSignUp();
        return;
      }
      setLoadingPlan(plan);
      try {
        const response = await fetch(`${API}/users/select-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            plan,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not update plan.");
        setUserInfo(data);
        setShowPaywall(false);

        if (plan === "monthly" || plan === "yearly") {
          const productId = plan === "monthly" ? "pdt_0NalSjZWHhamGs4oYJvTe" : "pdt_0NalSUMsJzvscQl8QNvVM";
          const returnUrl = encodeURIComponent(`${window.location.origin}`);
          const checkoutUrl = `https://checkout.dodopayments.com/buy/${productId}?client_reference_id=${user.id}&return_url=${returnUrl}`;
          window.location.href = checkoutUrl;
        }
      } catch (error) {
        setHelperText(error instanceof Error ? error.message : "Could not update plan.");
      } finally {
        setLoadingPlan(null);
      }
    },
    [openSignUp, user],
  );

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = selectedFile?.name
      ? selectedFile.name.replace(/\.[^.]+$/, "_cleanclip.webm")
      : "cleanclip-result.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedUrl, selectedFile]);

  const showOnboarding = Boolean(user && userInfo?.plan === "none");

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Decorative Sparkles/Background Stars (from reference) */}
      <div className="fixed top-20 left-10 text-yellow-500 rotate-12 opacity-60 select-none pointer-events-none text-2xl animate-float">✨</div>
      <div className="fixed bottom-40 right-10 text-yellow-500 -rotate-12 opacity-60 select-none pointer-events-none text-xl animate-float delay-1000">✨</div>
      <div className="fixed top-1/2 left-20 text-yellow-500 opacity-30 select-none pointer-events-none text-3xl animate-pulse">✦</div>

      <div className="w-full max-w-[1240px] main-card mt-4 md:mt-8 p-6 md:p-12 mb-20 animate-fade-in flex flex-col min-h-[90vh]">
        <Navbar />

        {appState === "idle" && (
          <div className="flex-1 flex flex-col items-center">
            <HeroSection onFileSelected={handleFileSelected} helperText={helperText ?? creditLabel} />
            
            {/* Minimal Info Bar (from reference feel) */}
            <div className="w-full border-t border-black/5 pt-12 mt-auto">
               <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
                  <div className="flex items-center gap-3">
                     <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Fast AI Processing</span>
                  </div>
                  <div className="flex items-center gap-3 border-x border-black/10 px-12">
                     <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Privacy First</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Free Downloads</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {appState === "processing" && selectedFile && (
          <div className="flex-1 flex items-center justify-center py-20">
            <ProcessingScreen 
              fileName={selectedFile.name} 
              progress={progress} 
              step={step} 
            />
          </div>
        )}

        {appState === "result" && selectedFile && processedUrl && (
          <div className="flex-1 flex flex-col items-center py-20">
            <ResultSection
              originalUrl={originalUrl}
              processedUrl={processedUrl}
              fileName={selectedFile.name}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          </div>
        )}

        {appState === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
             <div className="w-full max-w-md rounded-[32px] border border-black/6 bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
               <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Error</p>
               <h2 className="mb-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">Something went wrong</h2>
               <p className="mb-8 text-sm leading-7 text-zinc-500">{errorMsg}</p>
               <button
                 onClick={handleReset}
                 className="cursor-pointer rounded-full bg-zinc-950 px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
               >
                 Try again
               </button>
             </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl space-y-32 mb-40 px-6">
        <HowItWorks />
        <PricingSection onUpgrade={handlePlanSelection} />
        <Footer />
      </div>

      {showPaywall && (
        <PaywallModal
          onChoosePlan={handlePlanSelection}
          onClose={() => setShowPaywall(false)}
          loadingPlan={loadingPlan}
        />
      )}

      {showOnboarding && (
        <OnboardingModal onSelect={handlePlanSelection} loadingPlan={loadingPlan} />
      )}
    </main>
  );
}
