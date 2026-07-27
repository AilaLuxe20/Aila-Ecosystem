"use client";

import { useCallback, useRef, useState } from "react";

import { useLatestRef } from "./use-latest-ref";

/** Options for {@link useControllableState}. */
export interface UseControllableStateOptions<T> {
  /** Controlled value. When defined, the hook never owns the state. */
  readonly value?: T;
  /** Initial value used when uncontrolled. */
  readonly defaultValue: T;
  /** Called whenever the value should change, in both modes. */
  readonly onChange?: (value: T) => void;
}

/**
 * Supports both controlled and uncontrolled usage from a single component.
 *
 * When `value` is provided the component is controlled and the parent owns the
 * state; otherwise internal state is used. Either way `onChange` fires, so a
 * parent can observe changes without taking ownership.
 *
 * Every design-system component that holds state uses this, which is what makes
 * `<Switch defaultChecked />` and `<Switch checked={x} onCheckedChange={setX} />`
 * both work without duplicated logic.
 *
 * @param options - Controlled value, default value, and change handler.
 * @returns A tuple of the current value and a setter accepting a value or updater.
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T, (next: T | ((previous: T) => T)) => void] {
  const { value, defaultValue, onChange } = options;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const onChangeRef = useLatestRef(onChange);

  // Mirrors the controlled value so functional updaters can read it without
  // the caller having to thread the previous value through.
  const controlledRef = useRef(value);
  controlledRef.current = value;

  const current = isControlled ? (value as T) : internalValue;
  const currentRef = useLatestRef(current);

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(currentRef.current)
          : next;

      if (!isControlled) setInternalValue(resolved);
      if (!Object.is(resolved, currentRef.current)) onChangeRef.current?.(resolved);
    },
    [isControlled, currentRef, onChangeRef],
  );

  return [current, setValue];
}
