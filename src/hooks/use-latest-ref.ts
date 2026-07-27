"use client";

import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Keeps a ref pointing at the most recent value.
 *
 * Use this to read a changing value (typically a callback prop) from inside a
 * long-lived effect, timer, or event listener without adding it to a dependency
 * array and tearing the subscription down on every render.
 *
 * @param value - The value to track.
 * @returns A ref whose `current` always holds the latest value.
 *
 * @example
 * const onChangeRef = useLatestRef(onChange);
 * useEffect(() => {
 *   const id = setInterval(() => onChangeRef.current(), 1000);
 *   return () => clearInterval(id);
 * }, [onChangeRef]);
 */
export function useLatestRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
