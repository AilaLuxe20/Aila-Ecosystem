import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Do not 301 www ↔ apex here. Cloudflare already proxies both hosts, Vercel
      // lists both as production, and a permanent host bounce against any
      // apex→www rule (or a cached 301) becomes ERR_TOO_MANY_REDIRECTS.
      // Clerk allows both origins; metadataBase stays the apex URL.
      { source: "/login", destination: "/sign-in", permanent: false },
      { source: "/signup", destination: "/sign-up", permanent: false },
      { source: "/guest", destination: "/sign-in", permanent: false },
      { source: "/configurations", destination: "/", permanent: false },
      { source: "/configurations/:path*", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            // Writer / Intelligence multimodal: mic for voice notes, camera for capture where supported
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
