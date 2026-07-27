/**
 * URL and query-string helpers.
 */

/** A value that can be serialised into a query string. */
export type QueryValue = string | number | boolean | null | undefined | readonly string[];

/** A map of query parameter names to serialisable values. */
export type QueryParams = Record<string, QueryValue>;

/**
 * Builds a query string from a parameter map.
 *
 * Nullish values and empty strings are omitted so URLs stay clean. Array values
 * are repeated as multiple entries with the same key.
 *
 * @param params - Parameters to serialise.
 * @returns The query string without a leading `?`, or an empty string.
 */
export function buildQueryString(params: QueryParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry !== "") search.append(key, entry);
      }
      continue;
    }

    search.append(key, String(value));
  }

  return search.toString();
}

/**
 * Appends parameters to a path or absolute URL, preserving existing ones.
 *
 * @param url - Path or absolute URL.
 * @param params - Parameters to append.
 * @returns The URL with the merged query string.
 */
export function withQueryParams(url: string, params: QueryParams): string {
  const query = buildQueryString(params);
  if (query.length === 0) return url;

  const [base, existingHash] = url.split("#", 2);
  const separator = base.includes("?") ? "&" : "?";
  const combined = `${base}${separator}${query}`;

  return existingHash ? `${combined}#${existingHash}` : combined;
}

/**
 * Parses a query string into a plain object.
 *
 * Keys that appear more than once become arrays.
 *
 * @param search - Query string, with or without a leading `?`.
 * @returns The parsed parameters.
 */
export function parseQueryString(search: string): Record<string, string | string[]> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const result: Record<string, string | string[]> = {};

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    result[key] = values.length > 1 ? values : values[0];
  }

  return result;
}

/**
 * Joins path segments with exactly one slash between each.
 *
 * @param segments - Path segments, which may have leading or trailing slashes.
 * @returns The joined path.
 */
export function joinPaths(...segments: readonly string[]): string {
  const joined = segments
    .filter((segment) => segment.length > 0)
    .map((segment, index) =>
      index === 0 ? segment.replace(/\/+$/, "") : segment.replace(/^\/+|\/+$/g, ""),
    )
    .filter((segment) => segment.length > 0)
    .join("/");

  return joined.length === 0 ? "/" : joined;
}

/**
 * Reports whether a URL points to a different origin than the app.
 *
 * @param url - URL to inspect.
 * @param origin - Origin to compare against. Defaults to the current page origin.
 * @returns True when the URL is external.
 */
export function isExternalUrl(url: string, origin?: string): boolean {
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("?")) return false;

  const base = origin ?? (typeof window === "undefined" ? undefined : window.location.origin);

  try {
    return new URL(url, base ?? "http://localhost").origin !== (base ?? "http://localhost");
  } catch {
    return false;
  }
}

/**
 * Reports whether a string parses as an absolute URL.
 *
 * @param value - Candidate URL.
 * @returns True when the value is an absolute URL.
 */
export function isAbsoluteUrl(value: string): boolean {
  return URL.canParse(value);
}

/**
 * Extracts the hostname from a URL, dropping any `www.` prefix.
 *
 * @param url - URL to inspect.
 * @returns The hostname, or the original string when it cannot be parsed.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Restricts a redirect target to same-origin paths.
 *
 * Rejects absolute URLs and protocol-relative paths so a user-supplied `next`
 * parameter cannot be used for an open-redirect attack.
 *
 * @param target - Candidate redirect path.
 * @param fallback - Path returned when the target is unsafe. Defaults to `"/"`.
 * @returns A safe same-origin path.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = "/"): string {
  if (!target) return fallback;
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//")) return fallback;
  if (target.includes("\\")) return fallback;
  return target;
}
