"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { processVideoBackground } from "@/utils/videoProcessor";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultSection from "./components/ResultSection";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import PaywallModal from "./components/PaywallModal";
import OnboardingModal from "./components/OnboardingModal";
import Footer from "./components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GUEST_USAGE_KEY = "cleanclip_guest_usage";

type AppState = "idle" | "processing" | "result" | "error";

interface UserInfo {
  user_id: string;
  email: string;
  plan: string;
  credits: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [guestUsage, setGuestUsage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  
  const [originalUrl, setOriginalUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const initGuest = () => {
      const today = new Date().toISOString().split('T')[0];
      const localGuest = localStorage.getItem(GUEST_USAGE_KEY);
      if (localGuest) {
        const { date, count } = JSON.parse(localGuest);
        if (date === today) setGuestUsage(count);
        else localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      } else {
        localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
    };
    initGuest();
  }, []);

  // 1b. Clerk Auth Sync with Retries
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const syncWithBackend = async () => {
      if (!isLoaded || !user) {
        setUserInfo(null);
        setToken(null);
        localStorage.removeItem("cleanclip_token");
        setIsSyncing(false);
        return;
      }

      setIsSyncing(true);
      try {
        const res = await fetch(`${API}/auth/clerk-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
          })
        });

        if (!res.ok) throw new Error("Sync failed");
        
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem("cleanclip_token", data.access_token);
        setUserInfo({
          user_id: data.user_id,
          email: user.primaryEmailAddress?.emailAddress || "",
          plan: data.plan,
          credits: data.credits
        });
        setIsSyncing(false);
        if (data.plan === "none" && !showOnboarding) {
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error("Sync error:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(syncWithBackend, 2000 * retryCount); // Exponential backoff
        } else {
          setIsSyncing(false);
        }
      }
    };

    syncWithBackend();
  }, [isLoaded, user]);

  // 2. Payment Integration
  useEffect(() => {
    // DodoPayments links are handled via direct redirect in handleUpgrade
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    // 1. Check Guest Limit
    if (!user || !userInfo) {
      if (guestUsage >= 3) {
        openSignIn();
        return;
      }
    } else if (userInfo.credits <= 0) {
      setShowPaywall(true);
      return;
    }

    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setAppState("processing");
    setProgress(5);
    setStep("Initializing Magic AI...");

    try {
      // 2. Start Local Processing
      const resultUrl = await processVideoBackground(file, (status) => {
        setProgress(status.progress);
        setStep(status.step);
      });

      // 3. Deduct Credit (Cloud)
      if (user && userInfo) {
        const res = await fetch(`${API}/deduct-credit`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ job_id: "local_job" }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserInfo(prev => prev ? { ...prev, credits: data.remaining_credits } : null);
        }
      } else {
        // Guest usage
        const today = new Date().toISOString().split('T')[0];
        const newCount = guestUsage + 1;
        setGuestUsage(newCount);
        localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      }

      setProcessedUrl(resultUrl);
      setAppState("result");
    } catch (err: any) {
      console.error("Client processing failed:", err);
      setErrorMsg(err.message || "Something went wrong with the AI Engine. Please try a shorter video.");
      setAppState("error");
    }
  }, [user, userInfo, guestUsage, token, openSignIn]);

  const handleReset = useCallback(() => {
    setAppState("idle");
    setSelectedFile(null);
    setProgress(0); setStep("");
    setOriginalUrl(""); setProcessedUrl("");
    setErrorMsg("");
  }, []);

  const handleUpgrade = async (plan: string) => {
    if (!isLoaded) return;
    
    if (!user) {
      openSignIn();
      return;
    }

    if (isSyncing || !userInfo) {
      setUpgrading(plan);
      setTimeout(() => setUpgrading(null), 3000);
      return;
    }

    const DODOPAYMENTS_LINKS: Record<string, string> = {
      monthly: "https://checkout.dodopayments.com/buy/pdt_0NalSjZWHhamGs4oYJvTe?quantity=99",
      yearly: "https://checkout.dodopayments.com/buy/pdt_0NalSUMsJzvscQl8QNvVM?quantity=99",
    };

    const link = DODOPAYMENTS_LINKS[plan];
    if (link) {
      window.location.href = link;
    } else {
      alert("Invalid plan selected");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cleanclip_token");
    setToken(null);
    setUserInfo(null);
  };

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = selectedFile?.name ? selectedFile.name.replace(/\.[^.]+$/, "_no_bg.webm") : "result.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-white">
      {showOnboarding && token && (
        <OnboardingModal
          token={token}
          onPaymentStart={handleUpgrade}
          onSuccess={(p, c) => {
            setShowOnboarding(false);
            setUserInfo(prev => prev ? { ...prev, plan: p, credits: c } : null);
          }}
        />
      )}

      {showPaywall && (
        <PaywallModal onUpgrade={handleUpgrade} onClose={() => setShowPaywall(false)} />
      )}

      <Navbar userInfo={userInfo} />

      {appState === "idle" && (
        <div className="animate-fade-in">
          <HeroSection onFileSelected={handleFileSelected} />
          <HowItWorks />
          <PricingSection onUpgrade={handleUpgrade} upgrading={upgrading} />
        </div>
      )}

      {appState === "processing" && selectedFile && (
        <ProcessingScreen fileName={selectedFile.name} progress={progress} step={step} />
      )}

      {appState === "error" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 animate-fade-in">
          <div className="max-w-md w-full text-center p-12 bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Upload Error</h2>
            <p className="text-[15px] text-gray-500 mb-10 leading-relaxed">{errorMsg}</p>
            <button 
              onClick={handleReset} 
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 cursor-pointer active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {appState === "result" && selectedFile && (
        <div className="animate-fade-in pt-16">
          <ResultSection originalUrl={originalUrl} processedUrl={processedUrl} fileName={selectedFile.name} onReset={handleReset} onDownload={handleDownload} />
          <div className="bg-gray-50">
            <PricingSection onUpgrade={handleUpgrade} upgrading={upgrading} />
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

