import { ProductMetadata } from "@/core/product-registry";

export const adsMetadata: ProductMetadata = {
  id: "ads",
  name: "Aila Ads",
  description: "Advertising platform for campaign management, audience targeting, and AI-powered ad optimization.",
  version: "1.0.0",
  category: "Marketing",
  tags: ["ads", "advertising", "campaigns", "targeting", "optimization", "media-buying"],
  dependencies: [],
  capabilities: ["campaign-management", "audience-targeting", "ai-optimization", "creative-studio", "analytics"],
  icon: "Megaphone",
  color: "#F59E0B",
  route: "/products/ads",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default adsMetadata;
