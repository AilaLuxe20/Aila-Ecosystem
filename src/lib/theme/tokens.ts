/**
 * TypeScript mirror of the design tokens declared in `src/styles/theme.css`.
 *
 * CSS remains the source of truth for rendering; this module exists so
 * TypeScript code — chart configuration, Framer Motion variants, canvas
 * drawing — can reference the same values with autocompletion and type safety.
 *
 * Values that a component reads at runtime are exposed as `var(--token)`
 * references rather than literals, so a theme override in CSS is picked up
 * without a rebuild.
 */

/** Semantic surface levels, ordered from furthest to nearest the viewer. */
export const SURFACES = {
  canvas: "var(--color-canvas)",
  sunken: "var(--color-surface-sunken)",
  base: "var(--color-surface)",
  raised: "var(--color-surface-raised)",
  overlay: "var(--color-surface-overlay)",
} as const;

/** A semantic surface level. */
export type Surface = keyof typeof SURFACES;

/** Semantic status colours. */
export const STATUS_COLORS = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
} as const;

/** A semantic status. */
export type StatusColor = keyof typeof STATUS_COLORS;

/** Elevation levels, from a hairline lift to a modal overlay. */
export const ELEVATIONS = {
  0: "none",
  1: "var(--shadow-elevation-1)",
  2: "var(--shadow-elevation-2)",
  3: "var(--shadow-elevation-3)",
  4: "var(--shadow-elevation-4)",
  5: "var(--shadow-elevation-5)",
} as const;

/** An elevation level. */
export type Elevation = keyof typeof ELEVATIONS;

/** Motion durations in milliseconds, matching the CSS `--duration-*` tokens. */
export const DURATIONS = {
  instant: 80,
  fast: 140,
  normal: 220,
  slow: 320,
  deliberate: 480,
} as const;

/** A named motion duration. */
export type DurationToken = keyof typeof DURATIONS;

/**
 * Cubic-bezier control points, matching the CSS `--ease-*` tokens.
 *
 * Framer Motion takes easing as a four-number tuple, which is why these are
 * stored as arrays rather than `cubic-bezier(...)` strings.
 */
export const EASINGS = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
  decelerate: [0, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** A named easing curve. */
export type EasingToken = keyof typeof EASINGS;

/** Border radii for the three structural scales. */
export const RADII = {
  control: "var(--radius-control)",
  panel: "var(--radius-panel)",
  modal: "var(--radius-modal)",
} as const;

/** Fixed layout metrics used by the application shell, in pixels. */
export const LAYOUT_METRICS = {
  sidebarWidth: 256,
  sidebarCollapsedWidth: 60,
  topBarHeight: 56,
} as const;

/** Stacking order for layered UI. Kept in one place to prevent z-index drift. */
export const Z_INDEX = {
  base: 0,
  raised: 10,
  sticky: 20,
  dropdown: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;

/** A named stacking level. */
export type ZIndexToken = keyof typeof Z_INDEX;

/**
 * Resolves a duration token to milliseconds.
 *
 * @param token - The duration token.
 * @returns The duration in milliseconds.
 */
export function duration(token: DurationToken): number {
  return DURATIONS[token];
}

/**
 * Resolves a duration token to seconds, the unit Framer Motion expects.
 *
 * @param token - The duration token.
 * @returns The duration in seconds.
 */
export function durationSeconds(token: DurationToken): number {
  return DURATIONS[token] / 1000;
}
