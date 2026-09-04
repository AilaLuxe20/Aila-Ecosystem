import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Aila Ecosystem",
    short_name: "Aila",
    description:
      "Aila Ecosystem — AI Writer, Intelligence, and premium digital products with the same account in the browser or as an installed app.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "any",
    background_color: "#030303",
    theme_color: "#030303",
    lang: "en",
    categories: ["productivity", "business", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open your Aila dashboard",
        url: "/dashboard?source=pwa",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Aila Writer",
        short_name: "Writer",
        description: "Open Aila Writer book studio",
        url: "/products/writer?source=pwa",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Intelligence",
        short_name: "Intelligence",
        description: "Open Aila Intelligence",
        url: "/products/intelligence?source=pwa",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Billing",
        short_name: "Billing",
        description: "Manage your Aila plan",
        url: "/billing?source=pwa",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
