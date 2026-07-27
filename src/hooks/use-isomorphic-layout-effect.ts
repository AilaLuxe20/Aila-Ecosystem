"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * React warns when `useLayoutEffect` runs during server rendering because it
 * cannot fire before paint there. Swapping the implementation keeps the warning
 * out of the console without changing browser behaviour.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
