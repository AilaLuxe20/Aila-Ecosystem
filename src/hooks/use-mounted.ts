"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reports whether the component has completed its first client render.
 *
 * Gate browser-only output on this to avoid hydration mismatches: the server
 * and the first client render both see `false`, and the real value appears on
 * the subsequent render.
 *
 * @returns True once mounted on the client.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return mounted;
}

/**
 * Returns a stable function that reports whether the component is still mounted.
 *
 * Call it before setting state from an async continuation to avoid updating an
 * unmounted component.
 *
 * @returns A function returning the current mounted state.
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
