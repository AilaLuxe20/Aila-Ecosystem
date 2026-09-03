const SW_PATH = "/sw.js";

export async function registerAilaServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_PWA_DEV) {
    // Avoid sticky caches during local development unless explicitly enabled
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: "/",
      updateViaCache: "none",
    });

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage("SKIP_WAITING");
        }
      });
    });

    return registration;
  } catch (error) {
    console.warn("[aila-pwa] service worker registration failed", error);
    return null;
  }
}
