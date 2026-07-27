"use client";

import { useEffect, useMemo } from "react";

import { useLatestRef } from "./use-latest-ref";

/**
 * Keyboard shortcut handling.
 *
 * Shortcuts are written as `"mod+k"`, `"shift+?"`, `"ctrl+alt+delete"`. The
 * `mod` modifier maps to Command on Apple platforms and Control elsewhere,
 * which is what users expect and what avoids hard-coding a platform check at
 * every call site.
 */

/** A parsed shortcut definition. */
interface ParsedShortcut {
  readonly key: string;
  readonly ctrl: boolean;
  readonly meta: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly mod: boolean;
}

/** Options for {@link useHotkeys}. */
export interface UseHotkeysOptions {
  /** Suspends the binding when false. Defaults to true. */
  readonly enabled?: boolean;
  /** Calls `preventDefault` on a match. Defaults to true. */
  readonly preventDefault?: boolean;
  /** Fires even while a text field has focus. Defaults to false. */
  readonly enableInFormFields?: boolean;
  /** Element to bind to. Defaults to `document`. */
  readonly target?: React.RefObject<HTMLElement | null>;
}

/**
 * Detects whether the current platform uses Command as its primary modifier.
 *
 * @returns True on Apple platforms.
 */
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
}

/**
 * Parses a shortcut string into its component parts.
 *
 * @param shortcut - Shortcut such as `"mod+shift+k"`.
 * @returns The parsed shortcut.
 */
function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  const modifiers = new Set(parts.slice(0, -1));
  const key = parts[parts.length - 1] ?? "";

  return {
    key,
    ctrl: modifiers.has("ctrl") || modifiers.has("control"),
    meta: modifiers.has("meta") || modifiers.has("cmd") || modifiers.has("command"),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt") || modifiers.has("option"),
    mod: modifiers.has("mod"),
  };
}

/**
 * Reports whether a keyboard event satisfies a parsed shortcut.
 *
 * @param event - The keyboard event.
 * @param shortcut - The parsed shortcut.
 * @returns True when the event matches exactly, modifiers included.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  const pressedKey = event.key.toLowerCase();
  const normalizedKey = pressedKey === " " ? "space" : pressedKey;

  if (normalizedKey !== shortcut.key && event.code.toLowerCase() !== shortcut.key) {
    return false;
  }

  const primaryHeld = isApplePlatform() ? event.metaKey : event.ctrlKey;

  if (shortcut.mod) {
    if (!primaryHeld) return false;
  } else {
    if (shortcut.ctrl !== event.ctrlKey) return false;
    if (shortcut.meta !== event.metaKey) return false;
  }

  if (shortcut.shift !== event.shiftKey) return false;
  if (shortcut.alt !== event.altKey) return false;

  return true;
}

/**
 * Reports whether an event originated from a text-entry control.
 *
 * @param event - The keyboard event.
 * @returns True when focus is in an input, textarea, select, or editable region.
 */
function isFormField(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Binds one or more keyboard shortcuts to a handler.
 *
 * @param shortcuts - A shortcut string, or several that share a handler.
 * @param handler - Invoked with the matching event.
 * @param options - Enablement, default-prevention, and target overrides.
 *
 * @example
 * useHotkeys("mod+k", () => setPaletteOpen(true));
 * useHotkeys(["escape"], close, { enableInFormFields: true });
 */
export function useHotkeys(
  shortcuts: string | readonly string[],
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeysOptions = {},
): void {
  const {
    enabled = true,
    preventDefault = true,
    enableInFormFields = false,
    target,
  } = options;

  const handlerRef = useLatestRef(handler);
  const shortcutList = useMemo(
    () => (typeof shortcuts === "string" ? [shortcuts] : [...shortcuts]),
    [shortcuts],
  );
  const shortcutKey = shortcutList.join("|");

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const parsed = shortcutKey.split("|").filter(Boolean).map(parseShortcut);
    const element: HTMLElement | Document = target?.current ?? document;

    const onKeyDown = (event: Event): void => {
      if (!(event instanceof KeyboardEvent)) return;
      if (!enableInFormFields && isFormField(event)) return;
      if (!parsed.some((shortcut) => matchesShortcut(event, shortcut))) return;

      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    };

    element.addEventListener("keydown", onKeyDown);
    return () => element.removeEventListener("keydown", onKeyDown);
  }, [shortcutKey, enabled, preventDefault, enableInFormFields, target, handlerRef]);
}

/** Handlers for individual keys, keyed by `KeyboardEvent.key`. */
export type KeyHandlerMap = Partial<Record<string, (event: KeyboardEvent) => void>>;

/**
 * Maps individual keys to handlers, without modifier parsing.
 *
 * Suited to roving-focus widgets — menus, listboxes, trees — where arrow keys
 * and Enter drive navigation.
 *
 * @param handlers - Map of `KeyboardEvent.key` to handler.
 * @param options - Enablement and target overrides.
 *
 * @example
 * useKeyboard({ ArrowDown: focusNext, ArrowUp: focusPrevious, Enter: select });
 */
export function useKeyboard(
  handlers: KeyHandlerMap,
  options: Pick<UseHotkeysOptions, "enabled" | "target" | "preventDefault"> = {},
): void {
  const { enabled = true, target, preventDefault = false } = options;
  const handlersRef = useLatestRef(handlers);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const element: HTMLElement | Document = target?.current ?? document;

    const onKeyDown = (event: Event): void => {
      if (!(event instanceof KeyboardEvent)) return;

      const handler = handlersRef.current[event.key];
      if (!handler) return;

      if (preventDefault) event.preventDefault();
      handler(event);
    };

    element.addEventListener("keydown", onKeyDown);
    return () => element.removeEventListener("keydown", onKeyDown);
  }, [enabled, target, preventDefault, handlersRef]);
}
