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
];