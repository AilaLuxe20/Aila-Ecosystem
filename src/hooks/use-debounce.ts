"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "./use-latest-ref";

/**
 * Returns a copy of a value that only updates after it has been stable for a
 * given delay.
 *
 * @param value - The value to debounce.
 * @param delayMs - Quiet period before the value updates. Defaults to 250ms.
 * @returns The debounced value.
 *
 * @example
 * const debouncedQuery = useDebounce(query, 300);
 * useEffect(() => { void search(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/** A debounced callback with manual cancel and flush controls. */
export interface DebouncedCallback<TArgs extends readonly unknown[]> {
  (...args: TArgs): void;
  /** Discards any pending invocation. */
  cancel: () => void;
  /** Invokes the pending call immediately, if there is one. */
  flush: () => void;
  /** Reports whether an invocation is currently scheduled. */
  isPending: () => boolean;
}

/**
 * Wraps a callback so it runs only after the given quiet period.
 *
 * The returned function is referentially stable, so it is safe to pass to
 * memoised children or use in a dependency array. Pending calls are discarded
 * on unmount.
 *
 * @param callback - The function to debounce.
 * @param delayMs - Quiet period in milliseconds. Defaults to 250ms.
 * @returns The debounced callback with `cancel`, `flush`, and `isPending`.
 */
export function useDebouncedCallback<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 250,
): DebouncedCallback<TArgs> {
  const callbackRef = useLatestRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<TArgs | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current === null || pendingArgsRef.current === null) return;

    clearTimeout(timerRef.current);
    timerRef.current = null;

    const args = pendingArgsRef.current;
    pendingArgsRef.current = null;
    callbackRef.current(...args);
  }, [callbackRef]);

  const isPending = useCallback(() => timerRef.current !== null, []);

  useEffect(() => cancel, [cancel]);

  const debounced = useCallback(
    (...args: TArgs) => {
      pendingArgsRef.current = args;

      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingArgsRef.current = null;
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs, callbackRef],
  );

  return Object.assign(debounced, { cancel, flush, isPending });
}
