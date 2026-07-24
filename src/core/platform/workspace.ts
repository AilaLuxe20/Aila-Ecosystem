import { products } from "../registry";
import type { ProductWorkspaceRegistration } from "../product-registry";

export function getWorkspaceProducts() {
    return products.filter((product) => product.enabled);
}

export const productWorkspaces: ProductWorkspaceRegistration[] = [
    {
        id: "commerce-workspace",
        productId: "commerce",
        title: "Aila Commerce Workspace",
        description: "Commerce operating system for intelligent online stores, inventory, and customer experiences.",
        route: "/products/commerce",
        widgets: ["storefront", "inventory", "payments", "analytics", "ai-pricing"],
        navigation: [
            { label: "Overview", href: "/products/commerce" },
            { label: "Storefront", href: "/products/commerce/storefront" },
            { label: "Inventory", href: "/products/commerce/inventory" },
            { label: "Payments", href: "/products/commerce/payments" },
            { label: "Analytics", href: "/products/commerce/analytics" },
        ],
    },
    {
        id: "finance-workspace",
        productId: "finance",
        title: "Aila Finance Workspace",
        description: "Financial intelligence platform for portfolio management, risk analysis, and automated investing.",
        route: "/products/finance",
        widgets: ["portfolio", "risk-analysis", "automated-investing", "financial-modeling", "market-data"],
        navigation: [
            { label: "Overview", href: "/products/finance" },
            { label: "Portfolio", href: "/products/finance/portfolio" },
            { label: "Risk Analysis", href: "/products/finance/risk" },
            { label: "Investing", href: "/products/finance/investing" },
            { label: "Market Data", href: "/products/finance/market" },
        ],
    },
    {
        id: "social-workspace",
        productId: "social",
        title: "Aila Social Workspace",
        description: "Social media platform for community building, content creation, and intelligent social experiences.",
        route: "/products/social",
        widgets: ["community", "content-creation", "social-graph", "ai-moderation", "analytics"],
        navigation: [
            { label: "Overview", href: "/products/social" },
            { label: "Community", href: "/products/social/community" },
            { label: "Content", href: "/products/social/content" },
            { label: "Messages", href: "/products/social/messages" },
            { label: "Analytics", href: "/products/social/analytics" },
        ],
    },
    {
        id: "ads-workspace",
        productId: "ads",
        title: "Aila Ads Workspace",
        description: "Advertising platform for campaign management, audience targeting, and AI-powered ad optimization.",
        route: "/products/ads",
        widgets: ["campaign-management", "audience-targeting", "ai-optimization", "creative-studio", "analytics"],
        navigation: [
            { label: "Overview", href: "/products/ads" },
            { label: "Campaigns", href: "/products/ads/campaigns" },
            { label: "Targeting", href: "/products/ads/targeting" },
            { label: "Creative Studio", href: "/products/ads/creative" },
            { label: "Performance", href: "/products/ads/performance" },
        ],
    },
    {
        id: "education-workspace",
        productId: "education",
        title: "Aila Education Workspace",
        description: "Education platform for learning management, AI tutoring, and personalized educational experiences.",
        route: "/products/education",
        widgets: ["learning-management", "ai-tutoring", "course-builder", "assessment", "personalization"],
        navigation: [
            { label: "Overview", href: "/products/education" },
            { label: "Courses", href: "/products/education/courses" },
            { label: "Students", href: "/products/education/students" },
            { label: "Assessments", href: "/products/education/assessments" },
            { label: "Analytics", href: "/products/education/analytics" },
        ],
    },
    {
        id: "shipping-workspace",
        productId: "shipping",
        title: "Aila Shipping Workspace",
        description: "Global logistics platform for shipment tracking, route optimization, and supply chain intelligence.",
        route: "/products/shipping",
        widgets: ["shipment-tracking", "route-optimization", "supply-chain", "fulfillment", "carrier-management"],
        navigation: [
            { label: "Overview", href: "/products/shipping" },
            { label: "Shipments", href: "/products/shipping/shipments" },
            { label: "Routes", href: "/products/shipping/routes" },
            { label: "Carriers", href: "/products/shipping/carriers" },
            { label: "Analytics", href: "/products/shipping/analytics" },
        ],
    },
    {
        id: "developer-workspace",
        productId: "developer",
        title: "Aila Developer Platform Workspace",
        description: "Developer workspace for building, deploying, and managing Aila products and integrations.",
        route: "/products/developer",
        widgets: ["sdk", "api-docs", "integrations", "deployment", "cli", "sandbox"],
        navigation: [
            { label: "Overview", href: "/products/developer" },
            { label: "SDK", href: "/products/developer/sdk" },
            { label: "API Docs", href: "/products/developer/docs" },
            { label: "Integrations", href: "/products/developer/integrations" },
            { label: "Sandbox", href: "/products/developer/sandbox" },
        ],
    },
    {
        id: "api-workspace",
        productId: "api",
        title: "Aila API Platform Workspace",
        description: "API management and gateway for building, securing, and orchestrating cross-product integrations.",
        route: "/products/api",
        widgets: ["api-gateway", "integration", "microservices", "security", "orchestration", "monitoring"],
        navigation: [
            { label: "Overview", href: "/products/api" },
            { label: "Gateway", href: "/products/api/gateway" },
            { label: "Integrations", href: "/products/api/integrations" },
            { label: "Security", href: "/products/api/security" },
            { label: "Monitoring", href: "/products/api/monitoring" },
        ],
    },
    {
        id: "ui-ux-workspace",
        productId: "ui-ux",
        title: "Aila UI/UX Workspace",
        description: "UI/UX design system for creating intelligent, adaptive user experiences across all Aila products.",
        route: "/products/ui-ux",
        widgets: ["design-system", "component-library", "prototyping", "accessibility", "adaptive-layout"],
        navigation: [
            { label: "Overview", href: "/products/ui-ux" },
            { label: "Components", href: "/products/ui-ux/components" },
            { label: "Prototyping", href: "/products/ui-ux/prototyping" },
            { label: "Accessibility", href: "/products/ui-ux/accessibility" },
            { label: "Layout", href: "/products/ui-ux/layout" },
        ],
    },
];

export function getProductWorkspace(productId: string) {
    return productWorkspaces.find((w) => w.productId === productId);
}
