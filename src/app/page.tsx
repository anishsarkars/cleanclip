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

          // Only update if progress is ahead of current (prevent jumps from stale data)
          const newProgress = data.progress ?? 0;
          setProgress((prev) => (newProgress > prev ? newProgress : prev));
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
    <main className="min-h-screen bg-white">
      <Navbar />

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
        <>
          <HeroSection onFileSelected={handleFileSelected} helperText={helperText ?? creditLabel} />
          <HowItWorks />
          <PricingSection onUpgrade={handlePlanSelection} />
          <Footer />
        </>
      )}

      {appState === "processing" && selectedFile && (
        <ProcessingScreen 
          fileName={selectedFile.name} 
          progress={progress} 
          step={step} 
          previewUrl={previewUrl} 
        />
      )}

      {appState === "result" && selectedFile && processedUrl && (
        <>
          <ResultSection
            originalUrl={originalUrl}
            processedUrl={processedUrl}
            fileName={selectedFile.name}
            onReset={handleReset}
            onDownload={handleDownload}
          />
          <Footer />
        </>
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
