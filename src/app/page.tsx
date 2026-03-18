"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultSection from "./components/ResultSection";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import PaywallModal from "./components/PaywallModal";
import OnboardingModal from "./components/OnboardingModal";
import Footer from "./components/Footer";
import { useUser, useClerk } from "@clerk/nextjs";

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [guestUsage, setGuestUsage] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  
  const [originalUrl, setOriginalUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // 1b. Clerk Auth Sync
  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${API}/auth/clerk-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
        })
      })
      .then(res => res.json())
      .then(data => {
        setToken(data.access_token);
        localStorage.setItem("cleanclip_token", data.access_token);
        setUserInfo({
          user_id: data.user_id,
          email: user.primaryEmailAddress?.emailAddress || "",
          plan: data.plan,
          credits: data.credits
        });
        if (data.plan === "none" && !showOnboarding) {
          setShowOnboarding(true);
        }
      })
      .catch(console.error);
    } else if (isLoaded && !user) {
      setUserInfo(null);
      setToken(null);
      localStorage.removeItem("cleanclip_token");
    }
  }, [isLoaded, user]);

  // 2. Load Razorpay Script
  useEffect(() => {
    // Razorpay removed (using DodoPayments checkout instead)
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollStatus = useCallback((jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/status/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();

        setProgress(data.progress ?? 0);
        setStep(data.step ?? "Processing…");

        if (data.status === "done") {
          stopPolling();

          // Refresh user data if logged in
          if (token) {
            const userRes = await fetch(`${API}/auth/me`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (userRes.ok) setUserInfo(await userRes.json());
          }

          const resultRes = await fetch(`${API}/result/${jobId}`);
          if (!resultRes.ok) throw new Error("Failed to fetch result");
          const blob = await resultRes.blob();
          setProcessedUrl(URL.createObjectURL(blob));
          setAppState("result");
        } else if (data.status === "error") {
          stopPolling();
          setErrorMsg(data.step || "Processing failed.");
          setAppState("error");
        }
      } catch (err) {
        stopPolling();
        setErrorMsg("Connection lost. Retrying…");
        setAppState("error");
      }
    }, 1500);
  }, [token]);

  const handleFileSelected = useCallback(async (file: File) => {
    // 1. Check Guest Limit
    if (!user || !userInfo) {
      if (guestUsage >= 3) {
        openSignIn();
        return;
      }
    } else if (userInfo.credits <= 0) {
      // Check auth credits
      setShowPaywall(true);
      return;
    }

    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProgress(0);
    setStep("Uploading…");
    setAppState("processing");

    const form = new FormData();
    form.append("file", file);

    try {
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/remove-bg`, {
        method: "POST",
        headers,
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.detail === "GUEST_LIMIT_REACHED") {
          openSignIn();
          handleReset();
          return;
        }
        if (data.detail === "CREDITS_EXHAUSTED") {
          setShowPaywall(true);
          handleReset();
          return;
        }
        throw new Error(data.detail || "Upload failed");
      }

      // Update Guest Usage locally if not logged in
      if (!user) {
        const today = new Date().toISOString().split('T')[0];
        const newCount = guestUsage + 1;
        setGuestUsage(newCount);
        localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      } else {
        setUserInfo(prev => prev ? { ...prev, credits: data.remaining_credits } : null);
      }

      setJobId(data.job_id);
      pollStatus(data.job_id);
    } catch (err: any) {
      setErrorMsg(err.message);
      setAppState("error");
    }
  }, [userInfo, guestUsage, token, pollStatus]);

  const handleReset = useCallback(() => {
    stopPolling();
    setAppState("idle");
    setSelectedFile(null);
    setProgress(0); setStep("");
    setOriginalUrl(""); setProcessedUrl("");
    setErrorMsg("");
  }, []);

  const handleUpgrade = async (plan: string) => {
    if (!user || !userInfo) {
      openSignIn();
      return;
    }

    try {
      if (plan !== "monthly" && plan !== "yearly") throw new Error("Invalid plan");

      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          customer: userInfo?.email ? { email: userInfo.email } : undefined,
          metadata: {
            source: "pricing",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      throw new Error("Missing checkout_url");

    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cleanclip_token");
    setToken(null);
    setUserInfo(null);
  };

  const handleDownload = async () => {
    if (!user || !userInfo) {
      openSignIn();
      return;
    }
    if (userInfo.credits <= 0) {
      setShowPaywall(true);
      return;
    }
    try {
      const res = await fetch(`${API}/deduct-credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ job_id: jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.detail === "CREDITS_EXHAUSTED" || res.status === 403) setShowPaywall(true);
        else alert(data.detail || "Error deducting credit");
        return;
      }
      setUserInfo({ ...userInfo, credits: data.remaining_credits });
      
      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = selectedFile?.name ? selectedFile.name.replace(/\.[^.]+$/, "_no_bg.webm") : "result.webm";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
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
        <>
          <div style={{ position: "relative" }}>
            <HeroSection onFileSelected={handleFileSelected} />
          </div>
          <HowItWorks />
          <PricingSection onUpgrade={handleUpgrade} />
        </>
      )
      }

      {
        appState === "processing" && selectedFile && (
          <ProcessingScreen fileName={selectedFile.name} progress={progress} step={step} />
        )
      }

      {
        appState === "error" && (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfdfc", padding: 24 }}>
            <div style={{ maxWidth: 400, textAlign: "center", padding: 40, background: "#fff", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Upload Error</h2>
              <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.5 }}>{errorMsg}</p>
              <button onClick={handleReset} style={{ padding: "10px 24px", background: "#111827", color: "#fff", borderRadius: 50, border: "none", fontWeight: 600, cursor: "pointer" }}>Retry</button>
            </div>
          </div>
        )
      }

      {
        appState === "result" && selectedFile && (
          <>
            <div style={{ paddingTop: 60 }}>
              <ResultSection originalUrl={originalUrl} processedUrl={processedUrl} fileName={selectedFile.name} onReset={handleReset} onDownload={handleDownload} />
            </div>
            <PricingSection onUpgrade={handleUpgrade} />
          </>
        )
      }

      <Footer />
    </main >
  );
}
