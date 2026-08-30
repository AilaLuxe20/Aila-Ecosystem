import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkMiddlewareOptions =
  process.env.VERCEL_ENV === "production"
    ? {
        authorizedParties: [
          "https://ailaluxe.com",
          "https://www.ailaluxe.com",
          "https://aila.website",
          "https://www.aila.website",
          "https://app.aila.website",
        ],
      }
    : undefined;

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
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
  ],
};
