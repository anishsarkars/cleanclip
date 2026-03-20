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
          // Use a cache-buster timestamp for reliable updates
          const response = await fetch(`${API}/status/${jobId}?t=${Date.now()}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Unable to fetch status.");
          
          if (data.created_at) setJobStartTime(data.created_at);
          const newProgress = data.progress ?? 0;
          setProgress((prev) => {
            // If backend progress is actually ahead, jump to it
            if (newProgress > prev) return newProgress;
            // Otherwise, drift slowly forward (0.1% every 250ms) to show "life"
            // Cap drift at 95% so it never finishes without the backend
            if (prev < 95) return prev + 0.1;
            return prev;
          });
          
          setStep(data.step ?? "Processing");
          if (data.preview_frame) setPreviewUrl(data.preview_frame);

          if (data.status === "done") {
            stopPolling();
            setProgress(100);
            setStep("Ready!");
            
            // Short delay so user can see it reach 100%
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
      }, 250); // Increased frequency for ultra-smooth "frame" ticking (0.25s)
    },
    [stopPolling, syncUser, user],
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      // If user is logged in but has no plan, wait for onboarding
      if (user && userInfo?.plan === "none") {
        setHelperText("Please select a plan to continue.");
        return;
      }

      setHelperText(null);
      setSelectedFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setAppState("processing");
      setStep("Starting upload...");
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (user) formData.append("clerk_user_id", user.id);

        // We use XMLHttpRequest for real upload progress tracking
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API}/process-video`, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Map 0-100% upload to 0-30% on the progress bar
            const percent = Math.round((event.loaded / event.total) * 30);
            setProgress(percent);
            const uploadPercent = Math.round((event.loaded / event.total) * 100);
            if (uploadPercent < 100) {
              setStep(`Uploading (${uploadPercent}%)`);
            } else {
              setStep("Finalizing upload...");
            }
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setStep("Ready to process...");
            setProgress(30);
            pollStatus(data.job_id);
          } else {
            let errorDetail = "Upload failed.";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorDetail = errorData.detail || errorDetail;
              
              if (errorDetail === "ONBOARDING_REQUIRED") {
                await syncUser();
                setAppState("idle");
                return;
              }
              if (errorDetail === "CREDITS_EXHAUSTED") {
                setShowPaywall(true);
                setAppState("idle");
                return;
              }
              if (errorDetail === "GUEST_LIMIT_REACHED") {
                openSignUp();
                setAppState("idle");
                return;
              }
            } catch { /* ignore parse error */ }
            
            setErrorMsg(errorDetail);
            setAppState("error");
          }
        };

        xhr.onerror = () => {
          setErrorMsg("Network error during upload.");
          setAppState("error");
        };

        xhr.send(formData);
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : "Initialization failed.");
        setAppState("error");
      }
    },
    [openSignUp, pollStatus, syncUser, user, userInfo?.plan],
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
          const productId = 
            plan === "monthly" 
              ? "pdt_0NalSjZWHhamGs4oYJvTe" 
              : "pdt_0NalSUMsJzvscQl8QNvVM";
          
          // Using a cleaner checkout URL without quantity=99
          // We also append the clerk_user_id as a metadata parameter if supported by Dodo,
          // but for now, we just fix the broken quantity and ensure it's a valid checkout.
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
    <main className="min-h-screen bg-[var(--color-beige-soft)] p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Background Sparkles */}
      <div className="absolute top-[10%] left-[15%] opacity-20 animate-pulse">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#EAB308" />
        </svg>
      </div>
      <div className="absolute bottom-[20%] right-[10%] opacity-15 animate-bounce-subtle">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#EAB308" />
        </svg>
      </div>

      {showOnboarding && (
        <OnboardingModal onSelect={handlePlanSelection} loadingPlan={loadingPlan} />
      )}

      {showPaywall && (
        <PaywallModal
          onChoosePlan={handlePlanSelection}
          onClose={() => setShowPaywall(false)}
          loadingPlan={loadingPlan}
        />
      )}

      {appState === "idle" && (
        <div className="mx-auto w-full max-w-[1440px] landing-card min-h-[90vh] flex flex-col relative">
          <Navbar />
          
          <div className="flex-1 px-8 md:px-16 pt-12 pb-24 text-center">
            {/* Playful elements around hero */}
            <div className="relative inline-block mb-6">
                <span className="absolute -top-6 -right-12 text-black font-handwriting rotate-12 text-[14px]">
                   NEW! <br /> <span className="text-[20px]">↘</span>
                </span>
                <span className="inline-block px-4 py-2 border border-black/10 rounded-full text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-6 bg-zinc-50/50">
                   The trend that you never see again
                </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-semibold tracking-[-0.05em] text-zinc-950 mb-12 max-w-4xl mx-auto leading-[1.05]">
               Spread Your Charming With <span className="relative">Your AI <span className="absolute -top-8 -right-8 opacity-40">✨</span></span>
            </h1>

            <div className="w-full max-w-2xl mx-auto mt-8">
              <HeroSection onFileSelected={handleFileSelected} helperText={helperText ?? creditLabel} />
            </div>

            {/* Floating details */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-5xl mx-auto items-end">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-black font-bold text-xs ring-4 ring-yellow-400/10">1</span>
                     <p className="text-sm font-bold uppercase tracking-widest text-zinc-950">Always Be Updated</p>
                  </div>
                  <div className="h-[2px] w-full bg-zinc-100 rounded-full overflow-hidden">
                     <div className="h-full w-1/3 bg-zinc-950" />
                  </div>
               </div>

               <div className="flex justify-center">
                   <div className="flex items-center gap-3 px-6 py-3 border border-black/5 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <span className="text-[18px]">🖱️</span>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">Scroll for more</p>
                   </div>
               </div>

               <div className="space-y-4">
                  <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
                    "Elevate your visual storytelling with AI-driven precision that speaks to your unique fashion sense."
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-zinc-900 border-2 border-white overflow-hidden shadow-sm">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                     </div>
                     <p className="text-[12px] font-bold text-zinc-900">Anish Sarkar</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {appState === "processing" && selectedFile && (
        <ProcessingScreen 
          fileName={selectedFile.name} 
          progress={progress} 
          step={step} 
          previewUrl={previewUrl} 
          startTime={jobStartTime}
        />
      )}

      {appState === "result" && (
         <div className="mx-auto w-full max-w-[1440px] landing-card min-h-[90vh] flex flex-col p-8 bg-[var(--color-beige-sparkle)]">
            <ResultSection 
              originalUrl={originalUrl} 
              processedUrl={processedUrl} 
              onReset={handleReset} 
              onDownload={handleDownload}
            />
         </div>
      )}

      {appState === "error" && (
        <section className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-24">
          <div className="w-full max-w-md rounded-[32px] border border-black/6 bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Error</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">Something went wrong</h2>
            <p className="mb-8 text-sm leading-7 text-zinc-500">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="cursor-pointer rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Try again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
