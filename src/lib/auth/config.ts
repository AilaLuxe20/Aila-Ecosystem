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
    "/api/project-inquiry",
    "/api/stripe/webhook",
    "/api/cron",
  ],

  protectedRoutes: [
    "/dashboard",
    "/api/calendar",
    "/api/business",
    "/api/automation",
    "/api/commerce",
    "/api/ads",
    "/api/apps",
    "/api/sites",
    "/api/flow",
    "/api/dashboard",
  ],
};
