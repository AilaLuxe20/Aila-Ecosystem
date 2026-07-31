"use client";

import { useState } from "react";

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
  const [previous, setPrevious] = useState<T | undefined>(undefined);
  const [current, setCurrent] = useState<T>(value);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}
