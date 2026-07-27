import { createLogger } from "@/lib/logger/logger";

/**
 * In-memory response cache with TTL, LRU eviction, and request coalescing.
 *
 * Coalescing matters as much as caching: when several components mount at once
 * and all request the same resource, only one network call is made and every
 * caller awaits the same promise.
 */

const cacheLogger = createLogger("api.cache");

/** A cached value and its expiry. */
interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
  /** Updated on read so the LRU eviction order stays accurate. */
  lastAccessed: number;
}

/** Options for {@link MemoryCache}. */
export interface MemoryCacheOptions {
  /** Default time-to-live in milliseconds. Defaults to 60 000. */
  readonly ttlMs?: number;
  /** Maximum entries retained before LRU eviction. Defaults to 200. */
  readonly maxEntries?: number;
}

/**
 * A bounded time-to-live cache.
 *
 * Deliberately process-local: it is a request-deduplication and latency
 * optimisation, not a source of truth. Nothing here survives a reload.
 */
export class MemoryCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  /** @param options - Time-to-live and capacity limits. */
  constructor(options: MemoryCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60_000;
    this.maxEntries = options.maxEntries ?? 200;
  }

  /**
   * Reads a value if it is present and unexpired.
   *
   * @param key - Cache key.
   * @returns The cached value, or `undefined` on a miss.
   */
  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Writes a value, evicting the least recently used entry when full.
   *
   * @param key - Cache key.
   * @param value - Value to store.
   * @param ttlMs - Overrides the default time-to-live.
   */
  set(key: string, value: T, ttlMs?: number): void {
    if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    this.entries.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.ttlMs),
      lastAccessed: Date.now(),
    });
  }

  /**
   * Reports whether a key holds a live entry.
   *
   * @param key - Cache key.
   * @returns True when present and unexpired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Removes a single entry.
   *
   * @param key - Cache key.
   */
  delete(key: string): void {
    this.entries.delete(key);
  }

  /**
   * Removes every entry whose key matches a pattern.
   *
   * Use this to invalidate a family of keys after a mutation, e.g. every
   * `users:*` entry once a user is updated.
   *
   * @param pattern - Substring or regular expression to match against keys.
   * @returns How many entries were removed.
   */
  invalidate(pattern: string | RegExp): number {
    const matches = (key: string): boolean =>
      typeof pattern === "string" ? key.includes(pattern) : pattern.test(key);

    let removed = 0;
    for (const key of [...this.entries.keys()]) {
      if (matches(key)) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    if (removed > 0) cacheLogger.debug("Invalidated cache entries.", { pattern: String(pattern), removed });
    return removed;
  }

  /** Removes every entry and abandons tracking of in-flight requests. */
  clear(): void {
    this.entries.clear();
    this.inFlight.clear();
  }

  /**
   * Returns the cached value, or produces it — coalescing concurrent callers.
   *
   * @param key - Cache key.
   * @param factory - Produces the value on a miss.
   * @param ttlMs - Overrides the default time-to-live.
   * @returns The cached or freshly produced value.
   */
  async resolve(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const promise = factory()
      .then((value) => {
        this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Drops expired entries.
   *
   * @returns How many entries were removed.
   */
  prune(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    return removed;
  }

  /** @returns The number of entries currently held, including expired ones. */
  get size(): number {
    return this.entries.size;
  }

  /** Removes the entry that was read longest ago. */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.entries) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) this.entries.delete(oldestKey);
  }
}

/**
 * Builds a stable cache key from a URL and optional parameters.
 *
 * Object keys are sorted so `{a,b}` and `{b,a}` produce the same key.
 *
 * @param url - Request URL or resource identifier.
 * @param params - Additional discriminators.
 * @returns The cache key.
 */
export function buildCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return url;

  const normalized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");

  return `${url}?${normalized}`;
}
