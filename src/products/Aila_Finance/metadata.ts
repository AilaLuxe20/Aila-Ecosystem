import { ProductMetadata } from "@/core/product-registry";

export const financeMetadata: ProductMetadata = {
  id: "finance",
  name: "Aila Finance",
  description: "Financial intelligence platform for portfolio management, risk analysis, and automated investing.",
  version: "1.0.0",
  category: "Finance",
  tags: ["finance", "portfolio", "investing", "risk", "trading", "banking"],
  dependencies: [],
  capabilities: ["portfolio", "risk-analysis", "automated-investing", "financial-modeling", "market-data"],
  icon: "Landmark",
  color: "#3B82F6",
  route: "/products/finance",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default financeMetadata;
