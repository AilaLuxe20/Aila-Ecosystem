/** Same-origin Clerk Frontend API proxy path used in production. */
export const CLERK_FAPI_PROXY_PATH = "/__clerk";

/**
 * Production Clerk keys encode FAPI host `clerk.aila.website`.
 * Browser calls from `ailaluxe.com` / `www.ailaluxe.com` fail with
 * `origin_invalid` unless FAPI is reached on the app origin.
 */
export function shouldUseClerkFrontendApiProxy(
  vercelEnv = process.env.VERCEL_ENV,
  nodeEnv = process.env.NODE_ENV,
): boolean {
  if (vercelEnv === "development" || vercelEnv === "test") return false;
  if (nodeEnv === "development" || nodeEnv === "test") return false;

  // Production and Preview must proxy FAPI onto the app origin.
  // `VERCEL_ENV` is sometimes missing from the layout/proxy bundle, so also
  // treat `NODE_ENV=production` (Vercel builds and `next start`) as hosted.
  return (
    vercelEnv === "production" ||
    vercelEnv === "preview" ||
    nodeEnv === "production"
  );
}
