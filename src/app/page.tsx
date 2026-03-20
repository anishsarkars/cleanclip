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
    if (user) {
       syncUser().catch(console.error);
    }
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
        const CHUNK_SIZE = 2 * 1024 * 1024; 
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

          if (!response.ok) throw new Error("Chunk upload failed.");
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
           if (err.detail === "CREDITS_EXHAUSTED") { setShowPaywall(true); setAppState("idle"); return; }
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
      if (!user) { openSignUp(); return; }
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
    link.download = selectedFile?.name ? selectedFile.name.replace(/\.[^.]+$/, "_cleanclip.webm") : "cleanclip-result.webm";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [processedUrl, selectedFile]);

  const showOnboarding = Boolean(user && userInfo?.plan === "none");

  return (
    <main className="min-h-screen relative overflow-hidden">
      
      {/* Background Orbital Rings (Dashboard Style) */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="bg-ring-line h-[500px] w-[500px] top-1/2 left-1/2" />
          <div className="bg-ring-line h-[800px] w-[800px] top-1/2 left-1/2" />
          <div className="bg-ring-line h-[1200px] w-[1200px] top-1/2 left-1/2" />
          <div className="bg-ring-line h-[1600px] w-[1600px] top-1/2 left-1/2" />
          
          <div className="absolute top-0 right-[-10%] h-[600px] w-[600px] bg-blue-500 opacity-20 blur-[180px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] bg-indigo-600 opacity-10 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-50 pt-8 px-6">
        <Navbar />
      </div>

      <div className="relative z-10 pt-10 pb-20">
        {appState === "idle" && (
          <HeroSection onFileSelected={handleFileSelected} helperText={helperText ?? creditLabel} />
        )}

        {appState === "processing" && (
           <ProcessingScreen fileName={selectedFile?.name || "file"} progress={progress} step={step} />
        )}

        {appState === "result" && (
           <ResultSection 
             originalUrl={originalUrl} 
             processedUrl={processedUrl} 
             fileName={selectedFile?.name || "clip.mp4"} 
             onReset={handleReset}
             onDownload={handleDownload}
           />
        )}

        {appState === "error" && (
          <div className="flex flex-col items-center py-40">
             <div className="glass-panel p-16 rounded-[48px] text-center max-w-lg">
                <h2 className="text-4xl font-bold mb-4">Something went wrong</h2>
                <p className="text-white/60 mb-10 leading-relaxed">{errorMsg}</p>
                <button onClick={handleReset} className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold hover:scale-105 transition-all">
                   Try again
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="relative z-10 bg-white text-zinc-950 pt-32 pb-40 px-6">
        <div className="max-w-6xl mx-auto space-y-40">
           <HowItWorks />
           <PricingSection onUpgrade={handlePlanSelection} />
           <Footer />
        </div>
      </div>

      {showPaywall && (
        <PaywallModal onChoosePlan={handlePlanSelection} onClose={() => setShowPaywall(false)} loadingPlan={loadingPlan} />
      )}

      {showOnboarding && (
        <OnboardingModal onSelect={handlePlanSelection} loadingPlan={loadingPlan} />
      )}
    </main>
  );
}
