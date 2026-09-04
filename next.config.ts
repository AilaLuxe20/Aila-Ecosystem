import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonical host: Clerk proxy is configured for apex only (www /__clerk → host_invalid)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ailaluxe.com" }],
        destination: "https://ailaluxe.com/:path*",
        permanent: true,
      },
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
