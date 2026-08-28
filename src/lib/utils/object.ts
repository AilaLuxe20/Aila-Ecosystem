/**
 * Object helpers with precise typing. All functions are non-mutating.
 */

/** A plain JSON-compatible record. */
export type UnknownRecord = Record<string, unknown>;

/**
 * Narrows a value to a plain object (excluding arrays and `null`).
 *
 * @param value - Value to test.
 * @returns True when the value is a plain record.
 */
export function isPlainObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Creates a new object containing only the requested keys.
 *
 * @param source - Source object.
 * @param keys - Keys to retain.
 * @returns A new object with just those keys.
 */
export function pick<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Creates a new object without the specified keys.
 *
 * @param source - Source object.
 * @param keys - Keys to drop.
 * @returns A new object without those keys.
 */
export function omit<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  const result: Record<PropertyKey, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (!excluded.has(key)) result[key] = value;
  }

  return result as Omit<T, K>;
}

/**
 * Typed wrapper around `Object.entries` that preserves key types.
 *
 * @param source - Source object.
 * @returns Key/value tuples with the object's own key type.
 */
export function entriesOf<T extends object>(source: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(source) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Typed wrapper around `Object.keys` that preserves key types.
 *
 * @param source - Source object.
 * @returns The object's own enumerable keys.
 */
export function keysOf<T extends object>(source: T): Array<keyof T> {
  return Object.keys(source) as Array<keyof T>;
}

/**
 * Recursively merges plain objects. Arrays and primitives from `source`
 * replace the corresponding value in `target`.
 *
 * @param target - Base object.
 * @param source - Partial overrides applied on top of the base.
 * @returns A new deeply merged object.
 */
export function deepMerge<T extends UnknownRecord>(target: T, source: Partial<T>): T {
  const result: UnknownRecord = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    if (sourceValue === undefined) continue;

    const targetValue = result[key];
    result[key] =
      isPlainObject(targetValue) && isPlainObject(sourceValue)
        ? deepMerge(targetValue, sourceValue)
        : sourceValue;
  }

  return result as T;
}

/**
 * Structurally compares two values for equality.
 *
 * Handles plain objects, arrays, and `Date` instances. Falls back to `Object.is`
 * for everything else.
 *
 * @param left - First value.
 * @param right - Second value.
 * @returns True when the values are structurally equal.
 */
export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => deepEqual(item, right[index]));
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) && deepEqual(left[key], right[key]),
    );
  }

  return false;
}

/**
 * Deeply clones a value using the structured-clone algorithm where available.
 *
 * @param value - Value to clone.
 * @returns An independent copy.
 */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Reads a nested value using a dot-delimited path.
 *
 * @param source - Object to read from.
 * @param path - Dot path such as `"user.address.city"`.
 * @returns The value at that path, or `undefined` when any segment is missing.
 */
export function getPath(source: unknown, path: string): unknown {
  if (path.length === 0) return source;

  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null) return undefined;

    if (Array.isArray(current)) {
      const index = Number(segment);
      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (isPlainObject(current)) return current[segment];

    return undefined;
  }, source);
}

/**
 * Returns a copy of an object with a nested value written at a dot path.
 *
 * Intermediate containers are created as needed — numeric segments produce
 * arrays, everything else produces objects.
 *
 * @param source - Object to update.
 * @param path - Dot path such as `"items.0.label"`.
 * @param value - Value to write.
 * @returns A new object with the value applied.
 */
export function setPath<T extends UnknownRecord>(source: T, path: string, value: unknown): T {
  if (path.length === 0) return source;

  const segments = path.split(".");

  const write = (current: unknown, depth: number): unknown => {
    const segment = segments[depth];
    const isLast = depth === segments.length - 1;
    const nextIsIndex = !isLast && Number.isInteger(Number(segments[depth + 1]));

    if (Number.isInteger(Number(segment)) && (Array.isArray(current) || current == null)) {
      const list = Array.isArray(current) ? [...current] : [];
      const index = Number(segment);
      list[index] = isLast ? value : write(list[index], depth + 1);
      return list;
    }

    const container: UnknownRecord = isPlainObject(current) ? { ...current } : {};
    container[segment] = isLast
      ? value
      : write(container[segment] ?? (nextIsIndex ? [] : {}), depth + 1);
    return container;
  };

  return write(source, 0) as T;
}

/**
 * Removes keys whose value is `undefined`.
 *
 * Useful before serialising a payload so optional fields are omitted rather
 * than sent as `null`.
 *
 * @param source - Source object.
 * @returns A new object without undefined values.
 */
export function stripUndefined<T extends UnknownRecord>(source: T): Partial<T> {
  const result: UnknownRecord = {};

  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) result[key] = value;
  }

  return result as Partial<T>;
}

/**
 * Reports whether an object, array, string, `Map`, or `Set` holds no entries.
 *
 * @param value - Value to inspect.
 * @returns True when the value is nullish or empty.
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}
