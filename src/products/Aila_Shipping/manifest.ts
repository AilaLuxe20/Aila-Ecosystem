import { ProductManifest } from "@/core/products/ProductManifest";

export const shippingManifest: ProductManifest = {
  id: "shipping",
  name: "Aila Shipping",
  route: "/products/shipping",
  description: "Global logistics platform for shipment tracking, route optimization, and supply chain intelligence.",
  icon: "Truck",
  category: "Commerce",
  enabled: true,
};

export default shippingManifest;
