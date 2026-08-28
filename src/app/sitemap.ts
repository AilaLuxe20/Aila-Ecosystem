import type { MetadataRoute } from "next";

import { ALL_PRODUCTS, SITE_URL } from "@/core/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = ALL_PRODUCTS.map((product) => ({
    url: `${SITE_URL}${product.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...products,
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
