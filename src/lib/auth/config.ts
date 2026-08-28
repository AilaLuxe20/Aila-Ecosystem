/**
 * Route lists kept in sync with `src/proxy.ts`.
 * Clerk enforcement lives in proxy.ts, not this file.
 */
export const authConfig = {
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/login",
    "/signup",
    "/guest",
    "/privacy",
    "/terms",
    "/s",
    "/build-with-aila",
    "/project-discovery",
    "/products/intelligence",
    "/api/project-inquiry",
    "/api/stripe/webhook",
    "/api/webhooks/clerk",
    "/api/cron",
  ],

  protectedRoutes: [
    "/dashboard",
    "/billing",
    "/products/ailalegal",
    "/products/business",
    "/products/automation",
    "/products/commerce",
    "/products/ads",
    "/products/calendar",
    "/products/sites",
    "/products/apps",
    "/products/flow",
    "/api/ai",
    "/api/calendar",
    "/api/business",
    "/api/automation",
    "/api/commerce",
    "/api/ads",
    "/api/apps",
    "/api/sites",
    "/api/flow",
    "/api/dashboard",
    "/api/billing",
  ],
};
