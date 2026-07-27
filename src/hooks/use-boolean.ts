"use client";

import { useCallback, useMemo, useState } from "react";

/** A boolean value bundled with its state transitions. */
export interface BooleanControls {
  readonly value: boolean;
  /** Sets the value to true. */
  readonly setTrue: () => void;
  /** Sets the value to false. */
  readonly setFalse: () => void;
  /** Inverts the value. */
  readonly toggle: () => void;
  /** Sets the value explicitly. */
  readonly setValue: (next: boolean) => void;
}

/**
 * Manages a boolean with named transitions instead of inline arrow functions.
 *
 * Every returned function is referentially stable, so passing `setTrue` to a
 * memoised child will not re-render it.
 *
 * @param initialValue - Starting value. Defaults to false.
 * @returns The value and its controls.
 *
 * @example
 * const dialog = useBoolean();
 * <Button onClick={dialog.setTrue}>Open</Button>
 * <Dialog open={dialog.value} onOpenChange={dialog.setValue} />
 */
export function useBoolean(initialValue = false): BooleanControls {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((current) => !current), []);

  return useMemo(
    () => ({ value, setTrue, setFalse, toggle, setValue }),
    [value, setTrue, setFalse, toggle],
  );
}

/**
 * Manages a boolean as a tuple, mirroring `useState`'s shape.
 *
 * @param initialValue - Starting value. Defaults to false.
 * @returns A tuple of the value, a toggle function, and an explicit setter.
 */
export function useToggle(
  initialValue = false,
): [boolean, () => void, (next: boolean) => void] {
  const { value, toggle, setValue } = useBoolean(initialValue);
  return [value, toggle, setValue];
}
