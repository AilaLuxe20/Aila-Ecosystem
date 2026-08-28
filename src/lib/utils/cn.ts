import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities.
 *
 * Later classes win over earlier ones when they target the same CSS property,
 * which makes it safe to expose `className` overrides on every component.
 *
 * @param inputs - Class values: strings, arrays, or condition maps.
 * @returns A single deduplicated class string.
 *
 * @example
 * cn("px-2 py-1", isLarge && "px-4") // -> "py-1 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
