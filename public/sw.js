/* Aila production service worker — safe caching only.
 * Never caches /api/*, auth, billing, checkout, or authenticated HTML as opaque private data.
 * Version bump CACHE_VERSION to invalidate.
 */
const CACHE_VERSION = "aila-pwa-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

const NEVER_CACHE_PATH_PREFIXES = [
  "/api/",
  "/__clerk",
  "/sign-in",
  "/sign-up",
  "/login",
  "/signup",
  "/billing",
  "/dashboard",
];

const NEVER_CACHE_HOST_PARTS = [
  "clerk.",
  "accounts.",
  "paystack",
  "stripe.com",
];

function shouldNeverCache(url) {
  try {
    const parsed = new URL(url);
    if (NEVER_CACHE_HOST_PARTS.some((part) => parsed.hostname.includes(part))) {
      return true;
    }
    if (parsed.origin !== self.location.origin) {
      // Cross-origin: do not put into our caches (Clerk, CDNs with credentials, etc.)
      return true;
    }
    const path = parsed.pathname;
    if (NEVER_CACHE_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))) {
      return true;
    }
    if (path.startsWith("/products/") && parsed.searchParams.has("_rsc")) {
      // App Router RSC payloads for product workspaces can include private UI state — network only
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function isStaticAsset(url) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== self.location.origin) return false;
    const path = parsed.pathname;
    return (
      path.startsWith("/_next/static/") ||
      path.startsWith("/icons/") ||
      path.endsWith(".webmanifest") ||
      /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|gif|svg|ico)$/i.test(path)
    );
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Offline install still succeeds; offline page may populate later
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("aila-pwa-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = request.url;
  if (shouldNeverCache(url)) {
    return; // network default — do not intercept private/sensitive traffic
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidateStatic(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response(
      "<!doctype html><title>Aila offline</title><body style='background:#030303;color:#fff;font-family:system-ui;padding:2rem'><h1>You are offline</h1><p>Reconnect to use Aila.</p></body>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

async function staleWhileRevalidateStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    void networkPromise;
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;
  return new Response("", { status: 503, statusText: "Offline" });
}

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});
