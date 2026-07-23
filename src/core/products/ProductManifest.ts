export interface ProductManifest {
    id: string;
    name: string;
    route: string;
    description: string;
    icon?: string;
    category: string;
    enabled: boolean;
}