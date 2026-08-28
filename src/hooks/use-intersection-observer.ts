"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "./use-latest-ref";

/** Options for {@link useIntersectionObserver}. */
export interface UseIntersectionObserverOptions {
  /** Margin around the root, in CSS units. */
  readonly rootMargin?: string;
  /** Visibility ratio(s) that trigger a callback. */
  readonly threshold?: number | readonly number[];
  /** Stops observing after the first intersection. */
  readonly once?: boolean;
  /** Pauses observation without unmounting. */
  readonly enabled?: boolean;
}

/**
 * Observes whether an element is intersecting the viewport.
 *
 * @param options - Observer configuration.
 * @returns A tuple of the callback ref to attach and whether it is intersecting.
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ once: true });
 * return <section ref={ref} data-visible={isVisible} />;
 */
export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {},
): [(node: T | null) => void, boolean] {
  const { rootMargin = "0px", threshold = 0, once = false, enabled = true } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !enabled || typeof IntersectionObserver === "undefined") return;
      if (once && hasTriggeredRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;

          setIsIntersecting(entry.isIntersecting);

          if (entry.isIntersecting && once) {
            hasTriggeredRef.current = true;
            observer.disconnect();
          }
        },
        { rootMargin, threshold: threshold as number | number[] },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    // `thresholdKey` stands in for the array so a fresh literal does not
    // recreate the observer on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rootMargin, thresholdKey, once, enabled],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, isIntersecting];
}

/** Options for {@link useInfiniteScroll}. */
export interface UseInfiniteScrollOptions {
  /** Whether another page exists. */
  readonly hasMore: boolean;
  /** Whether a page is currently loading. */
  readonly isLoading: boolean;
  /** Loads the next page. */
  readonly onLoadMore: () => void;
  /** How far ahead of the sentinel to trigger. Defaults to `"200px"`. */
  readonly rootMargin?: string;
}

/**
 * Loads more content when a sentinel element scrolls into view.
 *
 * Guards against duplicate loads while a request is in flight, which is the
 * usual cause of a page being fetched twice.
 *
 * @param options - Paging state and the loader callback.
 * @returns A callback ref to attach to a sentinel element after the last item.
 *
 * @example
 * const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });
 * return <>{items.map(renderItem)}<div ref={sentinelRef} /></>;
 */
export function useInfiniteScroll<T extends Element>(
  options: UseInfiniteScrollOptions,
): (node: T | null) => void {
  const { hasMore, isLoading, onLoadMore, rootMargin = "200px" } = options;

  const onLoadMoreRef = useLatestRef(onLoadMore);
  const [sentinelRef, isIntersecting] = useIntersectionObserver<T>({
    rootMargin,
    enabled: hasMore && !isLoading,
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) onLoadMoreRef.current();
  }, [isIntersecting, hasMore, isLoading, onLoadMoreRef]);

  return sentinelRef;
}
