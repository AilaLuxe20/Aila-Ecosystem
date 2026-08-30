/**
 * Intended public vs signed-in surfaces. Enforcement is resource-based:
 * pages call `requireProductAccess` / `auth()`, APIs call
 * `requireWorkspaceUser` / `requirePrismaUser`. `proxy.ts` only runs Clerk
 * session plumbing.
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
    "/s/:path*",
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
    "/products/daily",
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
    "/api/daily",
    "/api/apps",
    "/api/sites",
    "/api/flow",
    "/api/dashboard",
    "/api/billing",
  ],
};
