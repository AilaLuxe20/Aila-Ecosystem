"use client";

import { useEffect, useRef, useState } from "react";

import { useThrottledCallback } from "./use-throttle";

/** Scroll offset and derived direction. */
export interface ScrollPosition {
  readonly x: number;
  readonly y: number;
  /** Direction of the most recent vertical movement. */
  readonly direction: "up" | "down" | "none";
  /** True once scrolled past the threshold, used to condense sticky headers. */
  readonly isScrolled: boolean;
}

/** Options for {@link useScrollPosition}. */
export interface UseScrollPositionOptions {
  /** Element to observe. Defaults to the window. */
  readonly target?: React.RefObject<HTMLElement | null>;
  /** Offset past which `isScrolled` becomes true. Defaults to 8px. */
  readonly threshold?: number;
  /** Minimum time between updates. Defaults to 100ms. */
  readonly throttleMs?: number;
}

/**
 * Tracks scroll offset and direction.
 *
 * Direction is derived from the previous sample rather than from wheel events,
 * so it stays correct for keyboard, touch, and programmatic scrolling alike.
 *
 * @param options - Target, threshold, and throttle configuration.
 * @returns The current scroll position.
 */
export function useScrollPosition(options: UseScrollPositionOptions = {}): ScrollPosition {
  const { target, threshold = 8, throttleMs = 100 } = options;

  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: "none",
    isScrolled: false,
  });

  const lastYRef = useRef(0);

  const handleScroll = useThrottledCallback(() => {
    const element = target?.current;
    const x = element ? element.scrollLeft : window.scrollX;
    const y = element ? element.scrollTop : window.scrollY;

    const previousY = lastYRef.current;
    lastYRef.current = y;

    setPosition({
      x,
      y,
      direction: y === previousY ? "none" : y > previousY ? "down" : "up",
      isScrolled: y > threshold,
    });
  }, throttleMs);

  useEffect(() => {
    const element = target?.current;
    const source: HTMLElement | Window = element ?? window;

    handleScroll();
    source.addEventListener("scroll", handleScroll, { passive: true });
    return () => source.removeEventListener("scroll", handleScroll);
  }, [target, handleScroll]);

  return position;
}
