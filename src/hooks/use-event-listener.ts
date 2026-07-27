"use client";

import { useEffect } from "react";

import { useLatestRef } from "./use-latest-ref";

/**
 * Subscribes to a DOM event with a handler that can change without
 * re-subscribing.
 *
 * The listener is registered once per target and event name. The handler is
 * read through a ref, so passing an inline arrow function does not cause the
 * subscription to churn on every render.
 *
 * @param eventName - Event to listen for.
 * @param handler - Invoked when the event fires.
 * @param target - Element, ref, `window`, or `document`. Defaults to `window`.
 * @param options - Standard `addEventListener` options.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  target?: Window | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  target: Document | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: React.RefObject<HTMLElement | null> | HTMLElement | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  target?: React.RefObject<HTMLElement | null> | HTMLElement | Document | Window | null,
  options?: AddEventListenerOptions,
): void {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    const resolved =
      target === undefined
        ? typeof window === "undefined"
          ? null
          : window
        : target !== null && "current" in target
          ? target.current
          : target;

    if (!resolved) return;

    const listener = (event: Event): void => {
      handlerRef.current(event);
    };

    resolved.addEventListener(eventName, listener, options);
    return () => {
      resolved.removeEventListener(eventName, listener, options);
    };
  }, [eventName, target, options, handlerRef]);
}
