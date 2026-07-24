import { ProductManifest } from "@/core/products/ProductManifest";

export const apiManifest: ProductManifest = {
  id: "api",
  name: "Aila API Platform",
  route: "/products/api",
  description: "API management and gateway for building, securing, and orchestrating cross-product integrations.",
  icon: "KeyRound",
  category: "Developer",
  enabled: true,
};

export default apiManifest;
