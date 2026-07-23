export type ProductCategory =
    | "AI"
    | "Business"
    | "Healthcare"
    | "Legal"
    | "Development"
    | "Productivity"
    | "Commerce";

export interface ProductDefinition {
    id: string;
    name: string;
    description: string;
    route: string;
    category: ProductCategory;
    aiPrompt: string;
    enabled: boolean;
    icon: string;
}