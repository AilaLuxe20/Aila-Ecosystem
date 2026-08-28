/**
 * String manipulation helpers shared across the platform.
 */

/**
 * Unicode combining diacritical marks, left over after `NFKD` normalisation.
 * Built from a string literal so the source file stays pure ASCII.
 */
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Capitalises the first character and leaves the remainder untouched.
 *
 * @param value - Source string.
 * @returns The string with its first character upper-cased.
 */
export function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Converts a string to `kebab-case`.
 *
 * @param value - Source string in any casing.
 * @returns The kebab-cased string.
 */
export function kebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

/**
 * Converts a string to `camelCase`.
 *
 * @param value - Source string in any casing.
 * @returns The camel-cased string.
 */
export function camelCase(value: string): string {
  const parts = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/);

  if (parts.length === 0) return "";

  return parts
    .map((part, index) =>
      index === 0 ? part.toLowerCase() : capitalize(part.toLowerCase()),
    )
    .join("");
}

/**
 * Converts a string to `PascalCase`.
 *
 * @param value - Source string in any casing.
 * @returns The Pascal-cased string.
 */
export function pascalCase(value: string): string {
  return capitalize(camelCase(value));
}

/**
 * Converts a string to `Title Case`.
 *
 * @param value - Source string in any casing.
 * @returns The title-cased string.
 */
export function titleCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}

/**
 * Converts arbitrary text into a URL-safe slug.
 *
 * Diacritics are normalised away so `Café Münster` becomes `cafe-munster`.
 *
 * @param value - Source text.
 * @returns A lowercase, hyphen-separated slug.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates a string to a maximum length, appending a suffix when clipped.
 *
 * @param value - Source string.
 * @param maxLength - Maximum length of the result including the suffix.
 * @param suffix - Suffix appended when truncation occurs. Defaults to an ellipsis.
 * @returns The truncated string, or the original when short enough.
 */
export function truncate(value: string, maxLength: number, suffix = "…"): string {
  if (value.length <= maxLength) return value;
  const sliceLength = Math.max(0, maxLength - suffix.length);
  return value.slice(0, sliceLength).trimEnd() + suffix;
}

/**
 * Truncates the middle of a string, preserving both ends.
 *
 * Useful for file names and hashes where the extension or suffix matters.
 *
 * @param value - Source string.
 * @param maxLength - Maximum length of the result.
 * @returns The middle-truncated string.
 */
export function truncateMiddle(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const charsPerSide = Math.max(1, Math.floor((maxLength - 1) / 2));
  return `${value.slice(0, charsPerSide)}…${value.slice(value.length - charsPerSide)}`;
}

/**
 * Builds up to two uppercase initials from a name.
 *
 * @param value - Full name or label.
 * @returns One or two uppercase initials, or an empty string when unavailable.
 */
export function initials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Escapes characters that carry meaning inside a regular expression.
 *
 * @param value - Raw text to embed in a pattern.
 * @returns The escaped string.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Collapses runs of whitespace into single spaces and trims the result.
 *
 * @param value - Source string.
 * @returns The normalised string.
 */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Removes HTML tags from a string.
 *
 * This is a display helper, not a sanitiser — never use it to render untrusted
 * HTML. Use it to derive plain-text previews from rich content.
 *
 * @param value - Source string that may contain markup.
 * @returns The string with tags removed.
 */
export function stripHtml(value: string): string {
  return normalizeWhitespace(value.replace(/<[^>]*>/g, " "));
}

/**
 * Returns the pluralised form of a word based on a count.
 *
 * @param count - The quantity deciding the form.
 * @param singular - Singular noun.
 * @param plural - Optional irregular plural. Defaults to `singular + "s"`.
 * @returns The correctly pluralised noun.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Masks all but the last few characters of a sensitive string.
 *
 * @param value - Sensitive value such as a key or account number.
 * @param visibleChars - Number of trailing characters to leave visible.
 * @returns The masked string.
 */
export function maskSecret(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return "•".repeat(value.length);
  return "•".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/**
 * Splits a string into segments that alternate between non-matching and
 * matching text, enabling highlighted search results without `dangerouslySetInnerHTML`.
 *
 * @param value - The text to scan.
 * @param query - The search term.
 * @returns Ordered segments tagged with whether they matched.
 */
export function highlightSegments(
  value: string,
  query: string,
): ReadonlyArray<{ text: string; match: boolean }> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [{ text: value, match: false }];

  const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, "ig");
  return value
    .split(pattern)
    .filter((segment) => segment.length > 0)
    .map((segment) => ({
      text: segment,
      match: segment.toLowerCase() === trimmed.toLowerCase(),
    }));
}
