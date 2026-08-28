"use client";

import { useCallback, useMemo, useState } from "react";

import { INTERACTION_CONFIG } from "@/lib/config/app";

import { useDebounce } from "./use-debounce";

/** Search state and controls. */
export interface SearchResult<T> {
  /** Immediate input value, bound to the field. */
  readonly query: string;
  /** Value after the debounce interval, used to trigger work. */
  readonly debouncedQuery: string;
  /** Items matching the debounced query. */
  readonly results: readonly T[];
  /** True while the input and the debounced value disagree. */
  readonly isSearching: boolean;
  /** True when a query is present but nothing matched. */
  readonly isEmpty: boolean;
  readonly setQuery: (query: string) => void;
  readonly clear: () => void;
}

/** Options for {@link useSearch}. */
export interface UseSearchOptions<T> {
  /** The collection to filter. */
  readonly items: readonly T[];
  /** Fields consulted when matching. Ignored if `filter` is supplied. */
  readonly keys?: ReadonlyArray<keyof T>;
  /** Custom predicate, overriding the default substring match. */
  readonly filter?: (item: T, query: string) => boolean;
  /** Debounce interval in milliseconds. */
  readonly debounceMs?: number;
  /** Cap on returned results. */
  readonly limit?: number;
}

/**
 * Reads a field as lowercase text for comparison.
 *
 * @param value - Field value of unknown type.
 * @returns Lowercase text, or an empty string for values that cannot match.
 */
function toSearchableText(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "number" || typeof value === "boolean") return String(value).toLowerCase();
  return "";
}

/**
 * Filters a collection against a debounced query.
 *
 * Filtering is client-side and synchronous; for server-side search, feed
 * `debouncedQuery` into `useAsync` instead.
 *
 * @param options - Items, match configuration, and debounce interval.
 * @returns Search state and controls.
 *
 * @example
 * const { query, setQuery, results } = useSearch({ items: users, keys: ["name", "email"] });
 */
export function useSearch<T>(options: UseSearchOptions<T>): SearchResult<T> {
  const {
    items,
    keys,
    filter,
    debounceMs = INTERACTION_CONFIG.searchDebounceMs,
    limit,
  } = options;

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, debounceMs);

  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (trimmed.length === 0) return limit ? items.slice(0, limit) : items;

    const matches = items.filter((item) => {
      if (filter) return filter(item, trimmed);

      if (keys && keys.length > 0) {
        return keys.some((key) => toSearchableText(item[key]).includes(trimmed));
      }

      return toSearchableText(item).includes(trimmed);
    });

    return limit ? matches.slice(0, limit) : matches;
  }, [items, debouncedQuery, keys, filter, limit]);

  const clear = useCallback(() => setQuery(""), []);

  return {
    query,
    debouncedQuery,
    results,
    isSearching: query !== debouncedQuery,
    isEmpty: debouncedQuery.trim().length > 0 && results.length === 0,
    setQuery,
    clear,
  };
}
