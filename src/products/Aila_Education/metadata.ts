import { ProductMetadata } from "@/core/product-registry";

export const educationMetadata: ProductMetadata = {
  id: "education",
  name: "Aila Education",
  description: "Education platform for learning management, AI tutoring, and personalized educational experiences.",
  version: "1.0.0",
  category: "Education",
  tags: ["education", "learning", "lms", "tutoring", "courses", "ai-tutoring"],
  dependencies: [],
  capabilities: ["learning-management", "ai-tutoring", "course-builder", "assessment", "personalization"],
  icon: "GraduationCap",
  color: "#10B981",
  route: "/products/education",
  status: "building",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default educationMetadata;
