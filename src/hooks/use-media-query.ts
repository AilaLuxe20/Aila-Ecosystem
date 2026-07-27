"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { BREAKPOINTS, BREAKPOINT_ORDER, type Breakpoint } from "@/lib/config/app";

/**
 * Subscribes to a CSS media query.
 *
 * Built on `useSyncExternalStore` so the value is read consistently during
 * concurrent rendering and the server snapshot is explicit rather than guessed.
 *
 * @param query - A media query string, e.g. `"(min-width: 768px)"`.
 * @param serverFallback - Value used during server rendering. Defaults to false.
 * @returns True when the query currently matches.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};

      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return serverFallback;
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Reports whether the viewport is at or above a named breakpoint.
 *
 * @param breakpoint - The breakpoint to test.
 * @returns True when the viewport is at least that wide.
 */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

/**
 * Reports whether the viewport is below a named breakpoint.
 *
 * @param breakpoint - The breakpoint to test.
 * @returns True when the viewport is narrower than that breakpoint.
 */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 0.02}px)`);
}

/** The active breakpoint plus common derived flags. */
export interface BreakpointState {
  /** Largest breakpoint the viewport currently satisfies. */
  readonly active: Breakpoint;
  /** True below the `md` breakpoint. */
  readonly isMobile: boolean;
  /** True from `md` up to `lg`. */
  readonly isTablet: boolean;
  /** True at `lg` and above. */
  readonly isDesktop: boolean;
}

/**
 * Resolves the active responsive breakpoint.
 *
 * Each breakpoint is observed with its own listener rather than by measuring
 * `window.innerWidth`, so the hook never re-renders on resize events that do
 * not actually cross a boundary.
 *
 * @returns The active breakpoint and derived device flags.
 */
export function useBreakpoint(): BreakpointState {
  const xs = useBreakpointUp("xs");
  const sm = useBreakpointUp("sm");
  const md = useBreakpointUp("md");
  const lg = useBreakpointUp("lg");
  const xl = useBreakpointUp("xl");
  const xxl = useBreakpointUp("2xl");

  return useMemo(() => {
    const matches: Record<Breakpoint, boolean> = { xs, sm, md, lg, xl, "2xl": xxl };

    let active: Breakpoint = "xs";
    for (const breakpoint of BREAKPOINT_ORDER) {
      if (matches[breakpoint]) active = breakpoint;
    }

    return { active, isMobile: !md, isTablet: md && !lg, isDesktop: lg };
  }, [xs, sm, md, lg, xl, xxl]);
}

/**
 * Reports whether the user has asked for reduced motion.
 *
 * Animated components must honour this — it is an accessibility requirement,
 * not a preference.
 *
 * @returns True when reduced motion is requested.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Reports whether the operating system requests a dark colour scheme.
 *
 * @returns True when the system prefers dark.
 */
export function usePrefersDarkScheme(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)", true);
}

/**
 * Reports whether the primary input device is coarse, i.e. touch.
 *
 * @returns True on touch-primary devices.
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
