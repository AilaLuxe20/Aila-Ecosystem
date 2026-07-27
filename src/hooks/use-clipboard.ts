"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createLogger } from "@/lib/logger/logger";

const clipboardLogger = createLogger("hooks.clipboard");

/** State and controls for clipboard interaction. */
export interface ClipboardControls {
  /** True for a short window after a successful copy. */
  readonly copied: boolean;
  /** Set when the last copy attempt failed. */
  readonly error: Error | null;
  /** Copies text, resolving to whether it succeeded. */
  readonly copy: (text: string) => Promise<boolean>;
  /** Clears the `copied` and `error` state immediately. */
  readonly reset: () => void;
}

/**
 * Copies text to the clipboard and reports success for a short window.
 *
 * Falls back to a hidden `textarea` and `document.execCommand` when the async
 * Clipboard API is unavailable, which is still the case on non-secure origins.
 *
 * @param resetDelayMs - How long `copied` stays true. Defaults to 2000ms.
 * @returns The clipboard state and controls.
 *
 * @example
 * const { copy, copied } = useClipboard();
 * <Button onClick={() => void copy(token)}>{copied ? "Copied" : "Copy"}</Button>
 */
export function useClipboard(resetDelayMs = 2000): ClipboardControls {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();
      setError(null);

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();

          const succeeded = document.execCommand("copy");
          document.body.removeChild(textarea);

          if (!succeeded) throw new Error("Clipboard write was rejected.");
        }

        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), resetDelayMs);
        return true;
      } catch (caught) {
        const failure = caught instanceof Error ? caught : new Error("Clipboard write failed.");
        clipboardLogger.warn("Copy to clipboard failed.", { error: failure.message });
        setError(failure);
        setCopied(false);
        return false;
      }
    },
    [resetDelayMs, clearTimer],
  );

  return { copied, error, copy, reset };
}

/**
 * Binds {@link useClipboard} to one fixed value.
 *
 * @param text - The value to copy.
 * @param resetDelayMs - How long `copied` stays true. Defaults to 2000ms.
 * @returns A zero-argument copy function plus the copied flag.
 */
export function useCopy(
  text: string,
  resetDelayMs = 2000,
): { copy: () => Promise<boolean>; copied: boolean } {
  const { copy, copied } = useClipboard(resetDelayMs);
  return { copy: useCallback(() => copy(text), [copy, text]), copied };
}
