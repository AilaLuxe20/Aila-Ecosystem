import { z } from "zod";

/**
 * Shared Zod schemas and predicate helpers.
 *
 * Schemas defined here are the single source of truth for both client-side
 * form validation and server-side request parsing, so the two can never drift.
 */

/** Email address, trimmed and lower-cased. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

/** Absolute HTTP or HTTPS URL. */
export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required.")
  .pipe(z.url("Enter a valid URL."))
  .refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    "URL must start with http:// or https://.",
  );

/** UUID v4 identifier. */
export const uuidSchema = z.uuid("Enter a valid identifier.");

/** URL-safe slug. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(96, "Slug must be 96 characters or fewer.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

/** E.164 international phone number. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Enter a valid international phone number, e.g. +14155552671.");

/**
 * Password meeting the platform's minimum strength policy: at least twelve
 * characters with lower case, upper case, and a digit.
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/\d/, "Password must include a number.");

/** Non-empty trimmed string. */
export const nonEmptyStringSchema = z.string().trim().min(1, "This field is required.");

/** Hex colour such as `#0ea5e9`. */
export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Enter a valid hex colour.");

/** Positive integer. */
export const positiveIntSchema = z.coerce
  .number()
  .int("Must be a whole number.")
  .positive("Must be greater than zero.");

/** Standard pagination query parameters. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

/** Parsed pagination parameters. */
export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Strength score for a password, from 0 (unusable) to 4 (strong).
 */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Scores a password on length and character diversity.
 *
 * This drives the strength meter in `PasswordInput`; it does not replace
 * `passwordSchema`, which enforces the actual policy.
 *
 * @param password - Password to score.
 * @returns A score from 0 to 4.
 */
export function scorePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 0;

  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score += 1;

  return Math.min(score, 4) as PasswordStrength;
}

/**
 * Reports whether a string is a valid email address.
 *
 * @param value - Candidate email.
 * @returns True when valid.
 */
export function isEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Reports whether a string is a valid absolute URL.
 *
 * @param value - Candidate URL.
 * @returns True when valid.
 */
export function isUrl(value: string): boolean {
  return urlSchema.safeParse(value).success;
}

/**
 * Reports whether a string is a valid UUID.
 *
 * @param value - Candidate identifier.
 * @returns True when valid.
 */
export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

/**
 * Flattens a `ZodError` into a map of dot-path to first error message.
 *
 * The dot paths align with the field names used by the form engine, so the
 * result can be handed straight to `FormProvider`.
 *
 * @param error - The validation error to flatten.
 * @returns A map of field path to message.
 */
export function flattenZodError(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!(path in result)) result[path] = issue.message;
  }

  return result;
}

export { z };
