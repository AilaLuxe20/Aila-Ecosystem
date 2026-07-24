import { ProductMetadata } from "@/core/product-registry";

export const developerMetadata: ProductMetadata = {
  id: "developer",
  name: "Aila Developer Platform",
  description: "Developer workspace for building, deploying, and managing Aila products and integrations.",
  version: "1.0.0",
  category: "Developer",
  tags: ["developer", "sdk", "api", "integrations", "deployment", "cli"],
  dependencies: [],
  capabilities: ["sdk", "api-docs", "integrations", "deployment", "cli", "sandbox"],
  icon: "Wrench",
  color: "#8B5CF6",
  route: "/products/developer",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default developerMetadata;
