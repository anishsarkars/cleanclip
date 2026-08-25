"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultSection from "./components/ResultSection";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AppState = "idle" | "processing" | "result" | "error";

interface UserInfo {
  clerk_user_id: string;
  email: string;
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
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
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

  const creditLabel = "";

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
    (jobId: string, currentFileName?: string) => {
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
            
            setTimeout(async () => {
              if (data.result_url) {
                const url = `${API}${data.result_url}`;
                setProcessedUrl(url);

                // Add to Recents
                if (currentFileName) {
                  const storageKey = user ? `cleanclip_recents_${user.id}` : "cleanclip_recents";
                  const recentsStr = localStorage.getItem(storageKey);
                  let stored = recentsStr ? JSON.parse(recentsStr) : [];
                  stored.unshift({
                    name: currentFileName,
                    url: url,
                    timestamp: Date.now()
                  });
                  // Keep only last 5
                  stored = stored.slice(0, 5);
                  localStorage.setItem(storageKey, JSON.stringify(stored));
                  window.dispatchEvent(new Event("cleanclip_recents_updated"));
                }
              }
              if (user) await syncUser();
              setAppState("result");
              
              // Subtle confetti effect
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#2563EB', '#10B981', '#F8FAFC', '#60A5FA', '#34D399'],
                disableForReducedMotion: true
              });
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
            pollStatus(data.job_id, file.name);
          } else {
            let errorDetail = "Upload failed.";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorDetail = errorData.detail || errorDetail;
              
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
    [openSignUp, pollStatus, syncUser, user],
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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="p-0">
        <div className="relative rounded-none">
          
          {/* Immersive Cleanup: Hide Nav during critical processing to focus on the 'Clean UI' */}
          {appState !== "processing" && appState !== "idle" && (
            <Navbar theme={appState === "result" ? "light" : "dark"} />
          )}

          {/* 🔔 Premium Notification Toast */}
          {notification && (
            <div className="fixed top-24 md:top-32 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 animate-fade-in">
              <div className={`p-4 md:p-5 rounded-[32px] border shadow-[0_40px_80px_rgba(0,0,0,0.1)] backdrop-blur-3xl flex flex-col gap-1 ${
                notification.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-[0.2em] text-[10px] opacity-60">System Notification</span>
                  <button onClick={() => setNotification(null)} className="text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest px-2">Dismiss</button>
                </div>
                <p className="text-[14px] md:text-[15px] font-bold leading-relaxed">{notification.message}</p>
              </div>
            </div>
          )}



          {appState === "idle" && (
            <div className="animate-fade-in flex flex-col">
              <HeroSection onFileSelected={handleFileSelected} helperText={helperText ?? creditLabel} />
              
              {/* Unified White Background Container */}
              <div className="relative z-10 bg-white mt-12 md:mt-24 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-sm border border-black/5 mx-2 md:mx-6 mb-6">
                 <div className="space-y-0">
                   <HowItWorks />
                   <Footer />
                 </div>
              </div>
            </div>
          )}

          {appState === "processing" && selectedFile && (
            <div className="animate-fade-in">
              <ProcessingScreen 
                fileName={selectedFile.name} 
                progress={progress} 
                step={step} 
                startTime={jobStartTime}
              />
            </div>
          )}

          {appState === "result" && selectedFile && processedUrl && (
            <div className="animate-fade-in flex flex-col">
              <ResultSection
                originalUrl={originalUrl}
                processedUrl={processedUrl}
                fileName={selectedFile.name}
                onReset={handleReset}
                onDownload={handleDownload}
              />
              <div className="bg-white">
                 <Footer />
              </div>
            </div>
          )}

          {appState === "error" && (
            <section className="flex min-h-screen items-center justify-center bg-black px-6">
              <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-[64px] p-12 text-center shadow-2xl backdrop-blur-3xl">
                <h2 className="text-4xl font-black mb-4 tracking-tight text-white">Something went wrong</h2>
                <div className="bg-white/5 p-6 rounded-[24px] mb-10 text-left border border-white/5">
                   <p className="font-mono text-sm leading-7 break-words text-white/50">{errorMsg}</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="w-full h-16 rounded-full bg-white text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  Go back home
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
