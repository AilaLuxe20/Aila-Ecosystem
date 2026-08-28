"use client";

import { useEffect } from "react";

import { useLatestRef } from "./use-latest-ref";

/**
 * Invokes a handler when a pointer press or focus lands outside an element.
 *
 * Listens on `pointerdown` rather than `click` so the handler runs before the
 * press completes — this prevents a click that dismisses a popover from also
 * activating whatever sits beneath it.
 *
 * @param target - Ref to the element treated as "inside".
 * @param onOutside - Invoked with the originating event.
 * @param enabled - Set false to suspend the listener. Defaults to true.
 */
export function useClickOutside<T extends HTMLElement>(
  target: React.RefObject<T | null>,
  onOutside: (event: PointerEvent | FocusEvent) => void,
  enabled = true,
): void {
  const onOutsideRef = useLatestRef(onOutside);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const isOutside = (node: EventTarget | null): boolean => {
      const element = target.current;
      if (!element) return false;
      return node instanceof Node ? !element.contains(node) : true;
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (isOutside(event.target)) onOutsideRef.current(event);
    };

    const onFocusIn = (event: FocusEvent): void => {
      if (isOutside(event.target)) onOutsideRef.current(event);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [target, enabled, onOutsideRef]);
}
