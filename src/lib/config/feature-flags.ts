import type { RuntimeEnvironment } from "./env";
import { getEnvironment } from "./env";

/**
 * Compile-time feature flags.
 *
 * Each flag declares which environments it is enabled in, so a feature can ship
 * to development and preview while staying dark in production. Flags are
 * evaluated synchronously and are safe to read during render.
 */

/** Every known feature flag. */
export const FEATURE_FLAGS = [
  "commandPalette",
  "globalSearch",
  "notifications",
  "workspaceSwitcher",
  "quickActions",
  "formAutosave",
  "formDrafts",
  "dockingPanels",
  "dataTableExport",
  "performanceOverlay",
] as const;

/** A known feature flag name. */
export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

/** Environments in which each flag is enabled. */
const FLAG_ENVIRONMENTS: Record<FeatureFlag, readonly RuntimeEnvironment[]> = {
  commandPalette: ["development", "preview", "production"],
  globalSearch: ["development", "preview", "production"],
  notifications: ["development", "preview", "production"],
  workspaceSwitcher: ["development", "preview", "production"],
  quickActions: ["development", "preview", "production"],
  formAutosave: ["development", "preview", "production"],
  formDrafts: ["development", "preview", "production"],
  dockingPanels: ["development", "preview"],
  dataTableExport: ["development", "preview", "production"],
  performanceOverlay: ["development"],
};

/** Runtime overrides applied on top of the environment matrix. */
const overrides = new Map<FeatureFlag, boolean>();

/**
 * Reports whether a feature is enabled in the current environment.
 *
 * @param flag - The flag to evaluate.
 * @returns True when the feature is active.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const override = overrides.get(flag);
  if (override !== undefined) return override;

  return FLAG_ENVIRONMENTS[flag].includes(getEnvironment());
}

/**
 * Forces a flag on or off for the current process.
 *
 * Intended for tests and local debugging; overrides are not persisted.
 *
 * @param flag - The flag to override.
 * @param enabled - The value to force.
 */
export function setFeatureOverride(flag: FeatureFlag, enabled: boolean): void {
  overrides.set(flag, enabled);
}

/**
 * Clears a single override, or all of them when no flag is given.
 *
 * @param flag - The flag to reset. Omit to clear every override.
 */
export function clearFeatureOverride(flag?: FeatureFlag): void {
  if (flag) {
    overrides.delete(flag);
    return;
  }
  overrides.clear();
}

/**
 * Snapshots the resolved state of every flag.
 *
 * @returns A map of flag name to whether it is currently enabled.
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return Object.fromEntries(
    FEATURE_FLAGS.map((flag) => [flag, isFeatureEnabled(flag)]),
  ) as Record<FeatureFlag, boolean>;
}
