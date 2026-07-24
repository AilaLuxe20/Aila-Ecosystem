import { ProductMetadata } from "@/core/product-registry";

export const uiUxMetadata: ProductMetadata = {
    id: "ui-ux",
    name: "Aila UI/UX",
    description: "UI/UX design system for creating intelligent, adaptive user experiences across all Aila products.",
    version: "1.0.0",
    category: "Design",
    tags: ["design", "ui", "ux", "components", "prototyping", "accessibility"],
    dependencies: [],
    capabilities: ["design-system", "component-library", "prototyping", "accessibility", "adaptive-layout"],
    icon: "Palette",
    color: "#8B5CF6",
    route: "/products/ui-ux",
    status: "building",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-07-24T00:00:00Z"),
};

export default uiUxMetadata;
