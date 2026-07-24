import { ProductMetadata } from "@/core/product-registry";

export const shippingMetadata: ProductMetadata = {
  id: "shipping",
  name: "Aila Shipping",
  description: "Global logistics platform for shipment tracking, route optimization, and supply chain intelligence.",
  version: "1.0.0",
  category: "Commerce",
  tags: ["shipping", "logistics", "tracking", "supply-chain", "route-optimization", "fulfillment"],
  dependencies: [],
  capabilities: ["shipment-tracking", "route-optimization", "supply-chain", "fulfillment", "carrier-management"],
  icon: "Truck",
  color: "#6366F1",
  route: "/products/shipping",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default shippingMetadata;
