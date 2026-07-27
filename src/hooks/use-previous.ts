"use client";

import { useEffect, useRef } from "react";

/**
 * Returns the value from the previous render.
 *
 * @param value - The value to track.
 * @returns The prior value, or `undefined` on the first render.
 *
 * @example
 * const previousCount = usePrevious(count);
 * const isIncreasing = previousCount !== undefined && count > previousCount;
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
