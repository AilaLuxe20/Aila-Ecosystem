"use client";

import dynamic, { type DynamicOptions } from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";

import { deepEqual } from "@/lib/utils/object";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

/**
 * Performance helpers.
 *
 * These address the three costs that actually matter in this application:
 * shipping code that is never used, re-rendering on referentially unstable
 * values, and rendering content that is off screen.
 */

/**
 * Lazily loads a client component, excluding it from the server bundle.
 *
 * Use for heavy, interaction-gated surfaces — editors, charts, the document
 * analyser — where the code is not needed for first paint.
 *
 * @param loader - Dynamic import of the component module.
 * @param options - Loading placeholder and other `next/dynamic` options.
 * @returns The lazily loaded component.
 *
 * @example
 * const Editor = lazyClient(() => import("@/components/Editor"), {
 *   loading: () => <LoadingState label="Loading editor" />,
 * });
 */
export function lazyClient<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: Omit<DynamicOptions<P>, "ssr"> = {},
): ComponentType<P> {
  return dynamic(loader, { ...options, ssr: false });
}

/**
 * Lazily loads a component that still renders on the server.
 *
 * Splits the client bundle without sacrificing server-rendered markup, so the
 * content remains present for crawlers and first paint.
 *
 * @param loader - Dynamic import of the component module.
 * @param options - Loading placeholder and other `next/dynamic` options.
 * @returns The lazily loaded component.
 */
export function lazyServer<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: Omit<DynamicOptions<P>, "ssr"> = {},
): ComponentType<P> {
  return dynamic(loader, { ...options, ssr: true });
}

/**
 * Memoises a value using structural rather than referential comparison.
 *
 * Useful when a dependency is an object or array rebuilt on every render — the
 * standard `useMemo` would recompute each time even though the contents are
 * unchanged.
 *
 * @param factory - Produces the value.
 * @param dependency - The value compared structurally between renders.
 * @returns The memoised value.
 *
 * @example
 * const query = useDeepMemo(() => buildQuery(filters), filters);
 */
export function useDeepMemo<T, D>(factory: () => T, dependency: D): T {
  const dependencyRef = useRef<D>(dependency);
  const valueRef = useRef<T | undefined>(undefined);

  if (valueRef.current === undefined || !deepEqual(dependencyRef.current, dependency)) {
    dependencyRef.current = dependency;
    valueRef.current = factory();
  }

  return valueRef.current;
}

/**
 * Returns a referentially stable copy of a value, updated only when its
 * contents change.
 *
 * Pass the result into dependency arrays to stop inline object and array
 * literals from invalidating effects on every render.
 *
 * @param value - The value to stabilise.
 * @returns A reference that changes only on a structural change.
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Defers a value until the browser is idle.
 *
 * Use for expensive derived data that is not needed for the first paint, such
 * as an analytics summary beneath the fold.
 *
 * @param value - The value to defer.
 * @param timeoutMs - Maximum wait before the value is applied regardless.
 * @returns The deferred value, `null` until it is ready.
 */
export function useIdleValue<T>(value: T, timeoutMs = 500): T | null {
  const [deferred, setDeferred] = useState<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof window.requestIdleCallback !== "function") {
      const timer = setTimeout(() => setDeferred(value), 0);
      return () => clearTimeout(timer);
    }

    const handle = window.requestIdleCallback(() => setDeferred(value), { timeout: timeoutMs });
    return () => window.cancelIdleCallback(handle);
  }, [value, timeoutMs]);

  return deferred;
}

/** Props for {@link DeferredRender}. */
export interface DeferredRenderProps {
  /** Content rendered once the region approaches the viewport. */
  readonly children: React.ReactNode;
  /** Placeholder rendered before that, which should reserve the final height. */
  readonly placeholder?: React.ReactNode;
  /** How far ahead of the viewport to start rendering. Defaults to `"300px"`. */
  readonly rootMargin?: string;
}

/**
 * Renders its children only once the region nears the viewport.
 *
 * The placeholder should reserve roughly the final height; otherwise the page
 * shifts as content appears, which is worse than the render cost being avoided.
 *
 * @param props - Children, placeholder, and lookahead margin.
 * @returns The deferred region.
 */
export function DeferredRender({
  children,
  placeholder = null,
  rootMargin = "300px",
}: DeferredRenderProps): React.JSX.Element {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
    once: true,
  });

  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
}

/**
 * Creates a callback that runs at most once per animation frame.
 *
 * The correct throttle for anything driven by scroll, pointer movement, or
 * resize: it aligns work with the browser's paint schedule instead of an
 * arbitrary interval.
 *
 * @param callback - The function to schedule.
 * @returns A frame-throttled callback.
 */
export function useAnimationFrame<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
): (...args: TArgs) => void {
  const frameRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return useCallback((...args: TArgs) => {
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      callbackRef.current(...args);
    });
  }, []);
}

/** Result of {@link useVirtualRange}. */
export interface VirtualRange {
  /** Index of the first item to render. */
  readonly startIndex: number;
  /** Exclusive index of the last item to render. */
  readonly endIndex: number;
  /** Total scrollable height in pixels. */
  readonly totalHeight: number;
  /** Offset applied to the rendered window, in pixels. */
  readonly offsetTop: number;
  /** Attach to the scroll container. */
  readonly onScroll: (event: React.UIEvent<HTMLElement>) => void;
}

/**
 * Computes the visible window of a fixed-height list.
 *
 * A minimal windowing primitive for long lists of uniform rows. Lists with
 * variable row heights need a measuring virtualiser instead.
 *
 * @param itemCount - Total number of items.
 * @param itemHeight - Height of each item in pixels.
 * @param viewportHeight - Height of the scroll container in pixels.
 * @param overscan - Extra rows rendered beyond the viewport. Defaults to 5.
 * @returns The range to render and a scroll handler.
 */
export function useVirtualRange(
  itemCount: number,
  itemHeight: number,
  viewportHeight: number,
  overscan = 5,
): VirtualRange {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useAnimationFrame((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  });

  return useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / Math.max(itemHeight, 1));
    const startIndex = Math.max(0, Math.floor(scrollTop / Math.max(itemHeight, 1)) - overscan);
    const endIndex = Math.min(itemCount, startIndex + visibleCount + overscan * 2);

    return {
      startIndex,
      endIndex,
      totalHeight: itemCount * itemHeight,
      offsetTop: startIndex * itemHeight,
      onScroll,
    };
  }, [itemCount, itemHeight, viewportHeight, overscan, scrollTop, onScroll]);
}
