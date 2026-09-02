import { z } from "zod";

import { ConfigurationError } from "@/lib/errors/app-error";

/**
 * Environment variable access.
 *
 * Server variables are validated lazily on first read rather than at import
 * time. Eager validation would break `next build`, which imports modules in an
 * environment that deliberately lacks production secrets.
 *
 * Public variables are read through static `process.env.NEXT_PUBLIC_*` member
 * expressions because Next.js inlines those at build time — a dynamic lookup
 * such as `process.env[key]` would resolve to `undefined` in the browser.
 */

/** Deployment environment the app is running in. */
export type RuntimeEnvironment = "development" | "preview" | "production" | "test";

/**
 * Trims whitespace and quotes from env values.
 * A missing closing quote in `.env.local` would otherwise be sent as part of
 * the credential and rejected as 401.
 */
export function normalizeOptionalEnvValue(value: unknown): unknown {
  if (typeof value !== "string") return value;

  let next = value.trim();

  if (next.length >= 2) {
    const quote = next[0];
    if ((quote === '"' || quote === "'") && next.endsWith(quote)) {
      next = next.slice(1, -1).trim();
    }
  }

  if (next.startsWith('"') || next.startsWith("'")) {
    next = next.slice(1).trim();
  }

  if (next.endsWith('"') || next.endsWith("'")) {
    next = next.slice(0, -1).trim();
  }

  return next === "" ? undefined : next;
}

const optionalUrl = z.preprocess(
  normalizeOptionalEnvValue,
  z.string().url().optional(),
);

const optionalSecret = z.preprocess(
  normalizeOptionalEnvValue,
  z.string().min(1).optional(),
);

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  OPENROUTER_API_KEY: optionalSecret,
  RESEND_API_KEY: optionalSecret,
  RESEND_FROM_EMAIL: optionalSecret,
  PROJECT_INQUIRY_EMAIL: optionalSecret,
  DATABASE_URL: optionalSecret,
  SUPABASE_URL: optionalUrl,
  SUPABASE_PUBLISHABLE_KEY: optionalSecret,
  SUPABASE_SECRET_KEY: optionalSecret,
  SUPABASE_JWKS_URL: optionalUrl,
  CLERK_SECRET_KEY: optionalSecret,
  CLERK_WEBHOOK_SIGNING_SECRET: optionalSecret,
  STRIPE_SECRET_KEY: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  STRIPE_PRICE_PRO: optionalSecret,
  PAYSTACK_SECRET_KEY: optionalSecret,
  PAYSTACK_PUBLIC_KEY: optionalSecret,
  PAYSTACK_PLAN_CODE_MONTHLY: optionalSecret,
  PAYSTACK_PLAN_CODE_YEARLY: optionalSecret,
  CRON_SECRET: optionalSecret,
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("https://ailaluxe.com"),
  NEXT_PUBLIC_APP_ENV: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["development", "preview", "production", "test"]).optional(),
  ),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().default("/products/daily"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().default("/products/daily"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: optionalSecret,
});

/** Validated server-only environment variables. */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Validated browser-safe environment variables. */
export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

/**
 * Reads and validates server-only environment variables.
 *
 * @returns The validated server environment.
 * @throws {ConfigurationError} When a variable is present but malformed.
 * @throws {ConfigurationError} When called from browser code.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new ConfigurationError({
      message: "Server environment variables cannot be read in the browser.",
    });
  }

  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new ConfigurationError({
      message: "Server environment validation failed.",
      context: { issues: z.treeifyError(parsed.error) },
    });
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Browser-safe environment variables.
 *
 * Parsed once at module load. Every value is read through a static member
 * expression so the Next.js compiler can inline it.
 */
export const publicEnv: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
});

/**
 * Resolves the current deployment environment.
 *
 * Prefers the explicit `NEXT_PUBLIC_APP_ENV` so preview deployments can be
 * distinguished from production, which `NODE_ENV` alone cannot express.
 *
 * @returns The active runtime environment.
 */
export function getEnvironment(): RuntimeEnvironment {
  if (publicEnv.NEXT_PUBLIC_APP_ENV) return publicEnv.NEXT_PUBLIC_APP_ENV;
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

/** True when running in local development. */
export const isDevelopment = process.env.NODE_ENV === "development";

/** True when running a production build. */
export const isProduction = process.env.NODE_ENV === "production";

/** True when running under a test runner. */
export const isTest = process.env.NODE_ENV === "test";

/** True when executing on the server. */
export const isServer = typeof window === "undefined";

/** True when executing in the browser. */
export const isBrowser = !isServer;

/**
 * Reads an optional server secret without throwing when it is absent.
 *
 * @param key - The variable to read.
 * @returns The value, or `undefined` when unset.
 */
export function getOptionalSecret(key: keyof ServerEnv): string | undefined {
  const value = getServerEnv()[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Reads a required server secret.
 *
 * @param key - The variable to read.
 * @returns The value.
 * @throws {ConfigurationError} When the variable is missing.
 */
export function requireSecret(key: keyof ServerEnv): string {
  const value = getOptionalSecret(key);

  if (!value) {
    throw new ConfigurationError({
      message: `Missing required environment variable: ${key}.`,
      context: { key },
    });
  }

  return value;
}
