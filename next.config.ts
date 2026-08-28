import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/login", destination: "/sign-in", permanent: false },
      { source: "/signup", destination: "/sign-up", permanent: false },
      { source: "/guest", destination: "/sign-in", permanent: false },
      { source: "/configurations", destination: "/", permanent: false },
      { source: "/configurations/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
