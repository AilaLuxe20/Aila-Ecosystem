"use client";

import { useCallback, useEffect, useState } from "react";

import { createLogger } from "@/lib/logger/logger";

const storageLogger = createLogger("hooks.storage");

/** Which browser storage area to use. */
export type StorageArea = "local" | "session";

/**
 * Resolves a storage area, returning `null` when unavailable.
 *
 * Storage throws in private browsing modes and when disabled by policy, so
 * every access must be guarded rather than assumed.
 *
 * @param area - Which storage area to resolve.
 * @returns The storage object, or `null`.
 */
function resolveStorage(area: StorageArea): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Persists state to browser storage, synchronised across tabs.
 *
 * The initial render always returns `initialValue` so server and client markup
 * match; the stored value is applied immediately after mount. This avoids the
 * hydration mismatch that reading storage during render would cause.
 *
 * @param key - Storage key.
 * @param initialValue - Value used when nothing is stored.
 * @param area - Which storage area to use. Defaults to `"local"`.
 * @returns A tuple of the value, a setter, and a function that clears the key.
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  area: StorageArea = "local",
): [T, (next: T | ((previous: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const storage = resolveStorage(area);
    if (!storage) return;

    try {
      const raw = storage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        queueMicrotask(() => setValue(parsed));
      }
    } catch (error) {
      storageLogger.warn("Failed to read stored value.", { key, area, error: String(error) });
    }
  }, [key, area]);

  const write = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved =
          typeof next === "function" ? (next as (previous: T) => T)(previous) : next;

        const storage = resolveStorage(area);
        if (storage) {
          try {
            storage.setItem(key, JSON.stringify(resolved));
          } catch (error) {
            storageLogger.warn("Failed to persist value.", {
              key,
              area,
              error: String(error),
            });
          }
        }

        return resolved;
      });
    },
    [key, area],
  );

  const remove = useCallback(() => {
    resolveStorage(area)?.removeItem(key);
    setValue(initialValue);
  }, [key, area, initialValue]);

  // `storage` events only fire in other tabs, which is exactly the case we want
  // to react to: keeping duplicate tabs of the same app consistent.
  useEffect(() => {
    if (area !== "local" || typeof window === "undefined") return;

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== key) return;

      try {
        setValue(event.newValue === null ? initialValue : (JSON.parse(event.newValue) as T));
      } catch {
        setValue(initialValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, area, initialValue]);

  return [value, write, remove];
}

/**
 * Persists state to `localStorage`.
 *
 * @param key - Storage key.
 * @param initialValue - Value used when nothing is stored.
 * @returns A tuple of the value, a setter, and a function that clears the key.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((previous: T) => T)) => void, () => void] {
  return useStorage(key, initialValue, "local");
}

/**
 * Persists state to `sessionStorage`.
 *
 * @param key - Storage key.
 * @param initialValue - Value used when nothing is stored.
 * @returns A tuple of the value, a setter, and a function that clears the key.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((previous: T) => T)) => void, () => void] {
  return useStorage(key, initialValue, "session");
}
