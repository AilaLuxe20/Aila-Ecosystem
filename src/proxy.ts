import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  CLERK_FAPI_PROXY_PATH,
  shouldUseClerkFrontendApiProxy,
} from "@/lib/auth/clerk-fapi-proxy";

const useAuthorizedParties =
  process.env.VERCEL_ENV === "production" ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview");

const clerkMiddlewareOptions = {
  ...(useAuthorizedParties
    ? {
        authorizedParties: [
          "https://ailaluxe.website",
          "https://www.ailaluxe.website",
          "https://aila.website",
        ],
      }
    : {}),
  ...(shouldUseClerkFrontendApiProxy()
    ? {
        frontendApiProxy: {
          enabled: true,
          path: CLERK_FAPI_PROXY_PATH,
        },
      }
    : {}),
};

/**
 * Clerk session plumbing only. `createRouteMatcher` + `auth.protect()` in
 * middleware is deprecated. Authentication and product entitlements are
 * enforced on each page and route handler.
 */
export default clerkMiddleware(async () => {
  return;
}, clerkMiddlewareOptions);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk's Frontend API proxy
    "/__clerk/(.*)",
  ],
};
