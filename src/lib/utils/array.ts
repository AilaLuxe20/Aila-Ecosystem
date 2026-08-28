/**
 * Immutable array helpers. Every function returns a new array and never
 * mutates its input.
 */

/** Direction used when sorting collections. */
export type SortDirection = "asc" | "desc";

/**
 * Removes duplicate primitive values, preserving first-seen order.
 *
 * @param items - Source array.
 * @returns A new array without duplicates.
 */
export function unique<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

/**
 * Removes duplicates using a derived key, preserving first-seen order.
 *
 * @param items - Source array.
 * @param keyOf - Projects each item to its identity key.
 * @returns A new array with one entry per distinct key.
 */
export function uniqueBy<T, K>(items: readonly T[], keyOf: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

/**
 * Groups items into a map keyed by a derived value.
 *
 * @param items - Source array.
 * @param keyOf - Projects each item to its group key.
 * @returns A map of group key to the items in that group.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();

  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
}

/**
 * Splits an array into two arrays based on a predicate.
 *
 * @param items - Source array.
 * @param predicate - Returns true for items belonging to the first array.
 * @returns A tuple of `[matching, notMatching]`.
 */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): [T[], T[]] {
  const matching: T[] = [];
  const rest: T[] = [];

  items.forEach((item, index) => {
    if (predicate(item, index)) {
      matching.push(item);
    } else {
      rest.push(item);
    }
  });

  return [matching, rest];
}

/**
 * Splits an array into consecutive chunks of at most `size` items.
 *
 * @param items - Source array.
 * @param size - Maximum chunk length. Must be greater than zero.
 * @returns An array of chunks.
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [];

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

/**
 * Sorts by a derived comparable key without mutating the source array.
 *
 * @param items - Source array.
 * @param keyOf - Projects each item to a comparable key.
 * @param direction - Sort direction. Defaults to ascending.
 * @returns A new sorted array.
 */
export function sortBy<T>(
  items: readonly T[],
  keyOf: (item: T) => string | number | Date,
  direction: SortDirection = "asc",
): T[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const a = keyOf(left);
    const b = keyOf(right);

    if (a instanceof Date && b instanceof Date) {
      return (a.getTime() - b.getTime()) * multiplier;
    }
    if (typeof a === "number" && typeof b === "number") {
      return (a - b) * multiplier;
    }

    return String(a).localeCompare(String(b), undefined, { numeric: true }) * multiplier;
  });
}

/**
 * Removes `null` and `undefined` entries, narrowing the element type.
 *
 * @param items - Source array that may contain nullish entries.
 * @returns A new array containing only defined values.
 */
export function compact<T>(items: readonly (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item != null);
}

/**
 * Returns items present in the first array but absent from the second.
 *
 * @param items - Source array.
 * @param exclude - Values to remove.
 * @returns A new array with the excluded values removed.
 */
export function difference<T>(items: readonly T[], exclude: readonly T[]): T[] {
  const excluded = new Set(exclude);
  return items.filter((item) => !excluded.has(item));
}

/**
 * Returns items present in both arrays, preserving the first array's order.
 *
 * @param items - Source array.
 * @param other - Array to intersect with.
 * @returns A new array of shared values.
 */
export function intersection<T>(items: readonly T[], other: readonly T[]): T[] {
  const lookup = new Set(other);
  return items.filter((item) => lookup.has(item));
}

/**
 * Moves an item from one index to another.
 *
 * Out-of-range indices are clamped, making this safe to call directly from
 * drag-and-drop handlers.
 *
 * @param items - Source array.
 * @param from - Current index of the item.
 * @param to - Destination index.
 * @returns A new array with the item repositioned.
 */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  const lastIndex = result.length - 1;
  if (lastIndex < 0) return result;

  const source = Math.min(Math.max(from, 0), lastIndex);
  const target = Math.min(Math.max(to, 0), lastIndex);
  if (source === target) return result;

  const [moved] = result.splice(source, 1);
  result.splice(target, 0, moved);
  return result;
}

/**
 * Replaces the item at a given index.
 *
 * @param items - Source array.
 * @param index - Index to replace.
 * @param value - Replacement value.
 * @returns A new array, or a copy of the original when the index is out of range.
 */
export function replaceAt<T>(items: readonly T[], index: number, value: T): T[] {
  if (index < 0 || index >= items.length) return [...items];
  const result = [...items];
  result[index] = value;
  return result;
}

/**
 * Removes the item at a given index.
 *
 * @param items - Source array.
 * @param index - Index to remove.
 * @returns A new array without that item.
 */
export function removeAt<T>(items: readonly T[], index: number): T[] {
  if (index < 0 || index >= items.length) return [...items];
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

/**
 * Inserts a value at a given index.
 *
 * @param items - Source array.
 * @param index - Insertion index, clamped to the array bounds.
 * @param value - Value to insert.
 * @returns A new array containing the inserted value.
 */
export function insertAt<T>(items: readonly T[], index: number, value: T): T[] {
  const target = Math.min(Math.max(index, 0), items.length);
  return [...items.slice(0, target), value, ...items.slice(target)];
}

/**
 * Toggles membership of a value in an array.
 *
 * @param items - Source array.
 * @param value - Value to add when absent or remove when present.
 * @returns A new array reflecting the toggle.
 */
export function toggleItem<T>(items: readonly T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

/**
 * Sums a numeric projection of every item.
 *
 * @param items - Source array.
 * @param valueOf - Projects each item to a number.
 * @returns The total.
 */
export function sumBy<T>(items: readonly T[], valueOf: (item: T) => number): number {
  return items.reduce((total, item) => total + valueOf(item), 0);
}

/**
 * Creates a sequential range of integers.
 *
 * @param start - First value, inclusive.
 * @param end - Final value, exclusive.
 * @param step - Increment between values. Defaults to 1.
 * @returns The generated range.
 */
export function range(start: number, end: number, step = 1): number[] {
  if (step === 0) return [];

  const values: number[] = [];
  if (step > 0) {
    for (let value = start; value < end; value += step) values.push(value);
  } else {
    for (let value = start; value > end; value += step) values.push(value);
  }

  return values;
}
