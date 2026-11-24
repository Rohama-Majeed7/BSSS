"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Icon from "../ui/Icon";

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<void>;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
  mounted: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  promptInstall: async () => {},
  showIosGuide: false,
  setShowIosGuide: () => {},
  mounted: false,
});

export const usePwa = () => useContext(PwaContext);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Initial connectivity status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check if running in standalone mode (already installed)
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      setIsInstalled(isStandalone);

      // Detect iOS devices
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
      setIsIos(isIosDevice);

      // Check banner dismissal from storage
      const dismissed = localStorage.getItem("bss_pwa_banner_dismissed");

      // 2. Capture native beforeinstallprompt (Chrome / Edge / Android)
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        const installEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(installEvent);
        setIsInstallable(true);
        if (!dismissed && !isStandalone) {
          setShowBanner(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      // 3. Capture appinstalled event
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
      };

      window.addEventListener("appinstalled", handleAppInstalled);

      // 4. Register Service Worker only in production; clear stale dev SW/caches in development
      if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
        if (process.env.NODE_ENV === "production") {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((registration) => {
              registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                      console.log("[PWA] New version available.");
                    }
                  };
                }
              };
            })
            .catch((err) => {
              console.warn("[PWA] ServiceWorker registration skipped or failed:", err);
            });
        } else {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((reg) => reg.unregister());
          });
          if ("caches" in window) {
            caches.keys().then((keys) => {
              keys.forEach((key) => {
                if (key.startsWith("bss-sms-")) caches.delete(key);
              });
            });
          }
        }
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIos && !isInstalled) {
      setShowIosGuide(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("bss_pwa_banner_dismissed", "true");
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        promptInstall,
        showIosGuide,
        setShowIosGuide,
        mounted,
      }}
    >
      {children}

      {/* Offline Toast Notification (Only rendered after client mounted to prevent hydration mismatch) */}
      {mounted && !isOnline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-rose-900 text-white p-3.5 rounded-2xl shadow-2xl border border-rose-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
            <div>
              <p className="text-xs font-bold leading-tight">Working in Offline Mode</p>
              <p className="text-[10px] text-rose-200">Database changes are disabled while disconnected.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-white"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Non-intrusive Install App Banner (Desktop & Mobile Chrome/Edge/Samsung) */}
      {mounted && showBanner && isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-royal-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-gold-400/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-royal-900 border border-gold-400/50 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[10px] font-extrabold text-gold-400">BSS</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white leading-tight">Install Bright Stars SMS</h4>
              <p className="text-[10px] text-sky-200 mt-0.5">Quick home screen launch &amp; fullscreen view</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={promptInstall}
              className="bg-gold-400 hover:bg-gold-300 text-royal-950 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md transition touch-manipulation flex items-center gap-1.5"
            >
              <Icon name="download" className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari 'Add to Home Screen' Instructions Modal */}
      {mounted && showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-royal-900 text-gold-400 mx-auto flex items-center justify-center font-extrabold text-lg border-2 border-gold-400 shadow-md">
              BSS
            </div>
            <div>
              <h3 className="font-extrabold text-base text-royal-900">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-600 mt-1">
                Install Bright Stars SMS as a standalone app on your iOS device:
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-3 text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-royal-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  1
                </span>
                <p>
                  Tap the <strong>Share</strong> button <span className="inline-block px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-bold">⎋</span> in Safari's bottom toolbar.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-royal-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  2
                </span>
                <p>
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot; ⊕</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-royal-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  3
                </span>
                <p>
                  Tap <strong>Add</strong> in the top-right corner to launch like a native app.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-royal-900 hover:bg-royal-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
};

export default PwaProvider;
