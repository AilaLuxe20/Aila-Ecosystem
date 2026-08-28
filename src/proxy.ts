import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedPage = createRouteMatcher(["/dashboard(.*)"]);

const isProtectedApi = createRouteMatcher([
  "/api/calendar(.*)",
  "/api/business(.*)",
  "/api/automation(.*)",
  "/api/commerce(.*)",
  "/api/ads(.*)",
  "/api/apps(.*)",
  "/api/sites(.*)",
  "/api/flow(.*)",
  "/api/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req) || isProtectedApi(req)) {
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
