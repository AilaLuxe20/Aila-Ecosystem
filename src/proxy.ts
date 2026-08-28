import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/guest(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/s(.*)",
  "/build-with-aila(.*)",
  "/project-discovery(.*)",
  "/products/intelligence(.*)",
  "/api/project-inquiry(.*)",
  "/api/stripe/webhook(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/cron(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/billing(.*)",
  "/products/ailalegal(.*)",
  "/products/business(.*)",
  "/products/automation(.*)",
  "/products/commerce(.*)",
  "/products/ads(.*)",
  "/products/calendar(.*)",
  "/products/sites(.*)",
  "/products/apps(.*)",
  "/products/flow(.*)",
  "/api/ai(.*)",
  "/api/calendar(.*)",
  "/api/business(.*)",
  "/api/automation(.*)",
  "/api/commerce(.*)",
  "/api/ads(.*)",
  "/api/apps(.*)",
  "/api/sites(.*)",
  "/api/flow(.*)",
  "/api/dashboard(.*)",
  "/api/billing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
