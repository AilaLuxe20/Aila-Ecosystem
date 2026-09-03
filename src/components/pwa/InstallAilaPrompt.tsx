"use client";

import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "aila.pwa.install.dismissed";
const DISMISS_DAYS = 21;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readDismissedUntil(): number {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return 0;
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeDismissed(days = DISMISS_DAYS) {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
  } catch {
    // ignore quota / private mode
  }
}

function detectIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOther = !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/.test(ua);
  return iOS && webkit && (notOther || /Safari/.test(ua));
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || iosStandalone;
}

export function InstallAilaPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    if (Date.now() < readDismissedUntil()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
      window.setTimeout(() => setVisible(true), 1800);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    let iosTimer: number | undefined;
    if (detectIosSafari()) {
      iosTimer = window.setTimeout(() => {
        if (Date.now() < readDismissedUntil()) return;
        if (isStandaloneDisplay()) return;
        setIosHint(true);
        setVisible(true);
      }, 2400);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    writeDismissed();
    setVisible(false);
    setDeferred(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      } else {
        writeDismissed();
        setVisible(false);
      }
    } catch {
      writeDismissed(3);
      setVisible(false);
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  }, [deferred]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Aila"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:px-0"
    >
      <div className="pointer-events-auto rounded-[22px] border border-white/[0.12] bg-black/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/25 bg-[#030303]">
            {/* eslint-disable-next-line @next/next/no-img-element -- small install badge; avoid layout shift */}
            <img
              src="/icons/icon-96.png"
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Install Aila</p>
            <p className="mt-1 text-xs leading-5 text-neutral-400">
              {iosHint
                ? "On iPhone or iPad, tap Share, then Add to Home Screen. Same account and data as the browser."
                : "Add Aila to your device for a full-screen app experience. Same login, Writer, and products."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {deferred ? (
            <button
              type="button"
              onClick={() => void install()}
              disabled={installing}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {installing ? "Installing…" : "Install Aila"}
            </button>
          ) : iosHint ? (
            <div className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-neutral-300">
              <Share className="h-4 w-4 text-cyan-300" />
              Share → Add to Home Screen
            </div>
          ) : (
            <p className="flex-1 text-xs leading-5 text-neutral-500">
              Use your browser&apos;s Install / Add app menu when it appears.
            </p>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm text-neutral-300 transition hover:bg-white/[0.05]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
