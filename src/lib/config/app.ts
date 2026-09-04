import { getEnvironment, publicEnv } from "./env";

/**
 * Application-wide configuration.
 *
 * These are product decisions, not secrets. Anything sensitive belongs in
 * `env.ts` behind {@link getServerEnv}.
 */

/** Supported UI colour schemes. */
export type ThemeMode = "light" | "dark" | "system";

/** Static identity and branding values. */
export const APP_CONFIG = {
  name: "Aila Ecosystem",
  shortName: "Aila",
  description:
    "AI-powered websites, applications, automation systems and intelligent digital experiences.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "en-US",
  defaultThemeMode: "dark" satisfies ThemeMode,
  supportEmail: "ailaluxeventures@gmail.com",
  companyName: "Aila Luxe Ventures",
  secondaryEmail: "ailaluxeventures@outlook.com",
} as const;

/** Limits applied to API requests and client-side operations. */
export const REQUEST_CONFIG = {
  /** Default time budget for a single API call, in milliseconds. */
  timeoutMs: 30_000,
  /** Total attempts, including the first, for retryable failures. */
  retryAttempts: 3,
  /** Delay before the first retry, in milliseconds. */
  retryBaseDelayMs: 300,
  /** Upper bound on any single retry delay, in milliseconds. */
  retryMaxDelayMs: 10_000,
} as const;

/** Defaults for paginated collections. */
export const PAGINATION_CONFIG = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100] as const,
  maxPageSize: 100,
} as const;

/** Constraints applied to file uploads. */
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,
  maxFiles: 10,
  acceptedDocumentTypes: ["application/pdf", "text/plain"] as const,
  acceptedImageTypes: ["image/png", "image/jpeg", "image/webp", "image/avif"] as const,
} as const;

/** Timings that keep interaction behaviour consistent across the platform. */
export const INTERACTION_CONFIG = {
  /** Delay before a search input issues a request, in milliseconds. */
  searchDebounceMs: 250,
  /** Delay before a tooltip appears, in milliseconds. */
  tooltipDelayMs: 400,
  /** How long a toast stays on screen, in milliseconds. */
  toastDurationMs: 5_000,
  /** Interval between form autosaves, in milliseconds. */
  autosaveIntervalMs: 3_000,
  /** Idle period before a user is considered away, in milliseconds. */
  idleTimeoutMs: 60_000,
} as const;

/** Responsive breakpoints in pixels. Mirrors the Tailwind scale. */
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** A named responsive breakpoint. */
export type Breakpoint = keyof typeof BREAKPOINTS;

/** Breakpoint names ordered from smallest to largest. */
export const BREAKPOINT_ORDER: readonly Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

/** Keys used for values persisted in browser storage. */
export const STORAGE_KEYS = {
  themeMode: "aila:theme-mode",
  sidebarCollapsed: "aila:sidebar-collapsed",
  workspaceId: "aila:workspace-id",
  recentSearches: "aila:recent-searches",
  formDraftPrefix: "aila:form-draft:",
  panelLayoutPrefix: "aila:panel-layout:",
} as const;

/**
 * Builds an absolute URL against the configured application origin.
 *
 * @param path - Path beginning with a slash.
 * @returns The absolute URL.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, APP_CONFIG.url).toString();
}

/**
 * Returns the current environment alongside the static app config.
 *
 * @returns The resolved application configuration.
 */
export function getAppConfig(): typeof APP_CONFIG & { environment: ReturnType<typeof getEnvironment> } {
  return { ...APP_CONFIG, environment: getEnvironment() };
}
