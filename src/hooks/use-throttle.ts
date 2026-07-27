"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "./use-latest-ref";

/**
 * Returns a copy of a value that updates at most once per interval.
 *
 * Unlike {@link useDebounce}, this emits the leading value immediately, which
 * suits continuous streams such as scroll offsets where the first sample
 * matters.
 *
 * @param value - The value to throttle.
 * @param intervalMs - Minimum time between updates. Defaults to 200ms.
 * @returns The throttled value.
 */
export function useThrottle<T>(value: T, intervalMs = 200): T {
  const [throttled, setThrottled] = useState(value);
  const lastRunRef = useRef(0);

  useEffect(() => {
    const elapsed = Date.now() - lastRunRef.current;

    if (elapsed >= intervalMs) {
      lastRunRef.current = Date.now();
      setThrottled(value);
      return;
    }

    const timer = setTimeout(() => {
      lastRunRef.current = Date.now();
      setThrottled(value);
    }, intervalMs - elapsed);

    return () => clearTimeout(timer);
  }, [value, intervalMs]);

  return throttled;
}

/**
 * Wraps a callback so it runs at most once per interval.
 *
 * Fires on the leading edge, then suppresses further calls until the interval
 * elapses. The final suppressed call is emitted on the trailing edge so the
 * last value is never lost.
 *
 * @param callback - The function to throttle.
 * @param intervalMs - Minimum time between invocations. Defaults to 200ms.
 * @returns A referentially stable throttled callback.
 */
export function useThrottledCallback<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  intervalMs = 200,
): (...args: TArgs) => void {
  const callbackRef = useLatestRef(callback);
  const lastRunRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(
    (...args: TArgs) => {
      const elapsed = Date.now() - lastRunRef.current;

      if (elapsed >= intervalMs) {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
        return;
      }

      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        timerRef.current = null;
        callbackRef.current(...args);
      }, intervalMs - elapsed);
    },
    [intervalMs, callbackRef],
  );
}
