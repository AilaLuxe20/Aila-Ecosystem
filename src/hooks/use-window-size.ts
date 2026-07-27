"use client";

import { useEffect, useState } from "react";

import { useThrottledCallback } from "./use-throttle";

/** Viewport dimensions in pixels. */
export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Tracks the viewport size.
 *
 * Resize events are throttled because they fire continuously during a drag and
 * would otherwise re-render the tree on every frame.
 *
 * @param throttleMs - Minimum time between updates. Defaults to 150ms.
 * @returns The current viewport size, `0 × 0` before the first client render.
 */
export function useWindowSize(throttleMs = 150): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  const handleResize = useThrottledCallback(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  }, throttleMs);

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return size;
}
