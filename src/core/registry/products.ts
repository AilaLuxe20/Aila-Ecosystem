export type ProductDefinition = {
    id: string;
    name: string;
    description: string;
    icon?: string;
    route: string;
    category: string;
    enabled: boolean;
};

export const products: ProductDefinition[] = [
    {
        id: "intelligence",
        name: "Aila Intelligence",
        description: "Central AI workspace",
        route: "/intelligence",
        category: "Core",
        enabled: true,
    },
    {
        id: "legal",
        name: "AilaLegal AI",
        description: "Legal intelligence",
        route: "/legal",
        category: "Business",
        enabled: true,
    },
    {
        id: "business",
        name: "Aila Business AI",
        description: "Business intelligence",
        route: "/business",
        category: "Business",
        enabled: true,
    },
    {
        id: "automation",
        name: "Aila Automation",
        description: "Workflow automation",
        route: "/automation",
        category: "Business",
        enabled: true,
    },
    {
        id: "health",
        name: "Aila Health",
        description: "Healthcare workspace",
        route: "/health",
        category: "Healthcare",
        enabled: true,
    },

    // COMMERCE PRODUCTS

    {
        id: "commerce",
        name: "Aila Commerce",
        description: "Commerce operating system for intelligent online stores, inventory, and customer experiences.",
        route: "/products/commerce",
        category: "Commerce",
        enabled: true,
    },

    // FINANCE PRODUCTS

    {
        id: "finance",
        name: "Aila Finance",
        description: "Financial intelligence platform for portfolio management, risk analysis, and automated investing.",
        route: "/products/finance",
        category: "Finance",
        enabled: true,
    },

    // SOCIAL PRODUCTS

    {
        id: "social",
        name: "Aila Social",
        description: "Social media platform for community building, content creation, and intelligent social experiences.",
        route: "/products/social",
        category: "Social",
        enabled: true,
    },

    // MARKETING PRODUCTS

    {
        id: "ads",
        name: "Aila Ads",
        description: "Advertising platform for campaign management, audience targeting, and AI-powered ad optimization.",
        route: "/products/ads",
        category: "Marketing",
        enabled: true,
    },

    // EDUCATION PRODUCTS

    {
        id: "education",
        name: "Aila Education",
        description: "Education platform for learning management, AI tutoring, and personalized educational experiences.",
        route: "/products/education",
        category: "Education",
        enabled: true,
    },

    // SHIPPING PRODUCTS

    {
        id: "shipping",
        name: "Aila Shipping",
        description: "Global logistics platform for shipment tracking, route optimization, and supply chain intelligence.",
        route: "/products/shipping",
        category: "Commerce",
        enabled: true,
    },

    // DEVELOPER PRODUCTS

    {
        id: "developer",
        name: "Aila Developer Platform",
        description: "Developer workspace for building, deploying, and managing Aila products and integrations.",
        route: "/products/developer",
        category: "Developer",
        enabled: true,
    },

    // API PRODUCTS

    {
        id: "api",
        name: "Aila API Platform",
        description: "API management and gateway for building, securing, and orchestrating cross-product integrations.",
        route: "/products/api",
        category: "Developer",
        enabled: true,
    },

    // DESIGN PRODUCTS

    {
        id: "ui-ux",
        name: "Aila UI/UX",
        description: "UI/UX design system for creating intelligent, adaptive user experiences across all Aila products.",
        route: "/products/ui-ux",
        category: "Design",
        enabled: true,
    },
];
