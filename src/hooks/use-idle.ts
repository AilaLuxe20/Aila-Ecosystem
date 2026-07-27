"use client";

import { useEffect, useRef, useState } from "react";

import { INTERACTION_CONFIG } from "@/lib/config/app";

/** Events that count as user activity. */
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
] as const;

/**
 * Reports whether the user has been inactive for a period.
 *
 * Also treats a hidden tab as idle, so a background tab stops polling even if
 * the timer has not yet elapsed.
 *
 * @param timeoutMs - Inactivity period before going idle. Defaults to the platform setting.
 * @returns True while the user is idle.
 *
 * @example
 * const isIdle = useIdle(300_000);
 * useEffect(() => { if (isIdle) pauseLiveUpdates(); }, [isIdle]);
 */
export function useIdle(timeoutMs: number = INTERACTION_CONFIG.idleTimeoutMs): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reset = (): void => {
      setIsIdle(false);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") {
        setIsIdle(true);
        return;
      }
      reset();
    };

    reset();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [timeoutMs]);

  return isIdle;
}
