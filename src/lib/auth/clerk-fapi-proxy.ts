/** Same-origin Clerk Frontend API proxy path used in production. */
export const CLERK_FAPI_PROXY_PATH = "/__clerk";

/**
 * Production Clerk keys encode FAPI host `clerk.aila.website`.
 * Browser calls from `ailaluxe.com` / `www.ailaluxe.com` fail with
 * `origin_invalid` unless FAPI is reached on the app origin.
 */
export function shouldUseClerkFrontendApiProxy(
  vercelEnv = process.env.VERCEL_ENV,
): boolean {
  return vercelEnv === "production";
}
