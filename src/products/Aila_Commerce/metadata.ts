import { ProductMetadata } from "@/core/product-registry";

export const commerceMetadata: ProductMetadata = {
  id: "commerce",
  name: "Aila Commerce",
  description: "Commerce operating system for intelligent online stores, inventory, and customer experiences.",
  version: "1.0.0",
  category: "Commerce",
  tags: ["ecommerce", "store", "inventory", "payments", "customers"],
  dependencies: [],
  capabilities: ["storefront", "inventory", "payments", "analytics", "ai-pricing"],
  icon: "ShoppingCart",
  color: "#10B981",
  route: "/products/commerce",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default commerceMetadata;
