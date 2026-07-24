import { ProductMetadata } from "@/core/product-registry";

export const apiMetadata: ProductMetadata = {
  id: "api",
  name: "Aila API Platform",
  description: "API management and gateway for building, securing, and orchestrating cross-product integrations.",
  version: "1.0.0",
  category: "Developer",
  tags: ["api", "gateway", "integration", "microservices", "security", "orchestration"],
  dependencies: [],
  capabilities: ["api-gateway", "integration", "microservices", "security", "orchestration", "monitoring"],
  icon: "KeyRound",
  color: "#EC4899",
  route: "/products/api",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default apiMetadata;
