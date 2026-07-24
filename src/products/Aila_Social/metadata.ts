import { ProductMetadata } from "@/core/product-registry";

export const socialMetadata: ProductMetadata = {
  id: "social",
  name: "Aila Social",
  description: "Social media platform for community building, content creation, and intelligent social experiences.",
  version: "1.0.0",
  category: "Social",
  tags: ["social", "community", "content", "media", "networking", "ai-content"],
  dependencies: [],
  capabilities: ["community", "content-creation", "social-graph", "ai-moderation", "analytics"],
  icon: "Share2",
  color: "#8B5CF6",
  route: "/products/social",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default socialMetadata;
