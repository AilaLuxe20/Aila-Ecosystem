import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/billing", "/sign-in", "/sign-up"],
    },
    sitemap: "https://ailaluxe.com/sitemap.xml",
    host: "https://ailaluxe.com",
  };
}
