"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "./use-latest-ref";

/** Measured dimensions of an element in pixels. */
export interface ElementSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Observes an element with `ResizeObserver` and invokes a callback on change.
 *
 * The callback is read through a ref, so an inline arrow function will not
 * cause the observer to be torn down and recreated on every render.
 *
 * @param target - Ref to the element to observe.
 * @param onResize - Invoked with each observer entry.
 */
export function useResizeObserver<T extends Element>(
  target: React.RefObject<T | null>,
  onResize: (entry: ResizeObserverEntry) => void,
): void {
  const onResizeRef = useLatestRef(onResize);

  useEffect(() => {
    const element = target.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) onResizeRef.current(entry);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, onResizeRef]);
}

/**
 * Measures an element and keeps the measurement current as it resizes.
 *
 * Returns a callback ref rather than an object ref so measurement begins the
 * moment the node attaches, including for conditionally rendered elements.
 *
 * @returns A tuple of the callback ref to attach and the current size.
 *
 * @example
 * const [ref, { width }] = useElementSize<HTMLDivElement>();
 * return <div ref={ref}>{width}px</div>;
 */
export function useElementSize<T extends HTMLElement>(): [
  (node: T | null) => void,
  ElementSize,
] {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node || typeof ResizeObserver === "undefined") {
      setSize({ width: 0, height: 0 });
      return;
    }

    const rect = node.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // `borderBoxSize` avoids a layout read; fall back for older engines.
      const box = entry.borderBoxSize?.[0];
      setSize(
        box
          ? { width: box.inlineSize, height: box.blockSize }
          : { width: entry.contentRect.width, height: entry.contentRect.height },
      );
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, size];
}
