import { ProductManifest } from "@/core/products/ProductManifest";

export const developerManifest: ProductManifest = {
  id: "developer",
  name: "Aila Developer Platform",
  route: "/products/developer",
  description: "Developer workspace for building, deploying, and managing Aila products and integrations.",
  icon: "Wrench",
  category: "Developer",
  enabled: true,
};

export default developerManifest;
