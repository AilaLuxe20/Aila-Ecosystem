import {
    AppWindow,
    BarChart3,
    Bot,
    Brain,
    BriefcaseBusiness,
    Calendar,
    Cloud,
    Code2,
    Folder,
    GitBranch,
    Globe,
    GraduationCap,
    HeartPulse,
    KeyRound,
    Landmark,
    Mail,
    Megaphone,
    Palette,
    Scale,
    Settings,
    Share2,
    ShoppingCart,
    Truck,
    Users,
    Video,
    Wrench,
} from "lucide-react";

export type ProductStatus =
    | "live"
    | "building"
    | "system";

export interface Product {
    id: string;
    name: string;
    href: string;
    icon: any;
    status: ProductStatus;
    description: string;
}

export const products: Product[] = [
    // LIVE PRODUCTS

    {
        id: "intelligence",
        name: "Aila Intelligence",
        href: "/products/intelligence",
        icon: Brain,
        status: "live",
        description: "Enterprise AI intelligence workspace.",
    },
    {
        id: "legal",
        name: "Aila Legal",
        href: "/products/ailalegal",
        icon: Scale,
        status: "live",
        description: "Legal AI and document intelligence.",
    },
    {
        id: "business",
        name: "Aila Business",
        href: "/products/business",
        icon: BriefcaseBusiness,
        status: "live",
        description: "Business intelligence and operations.",
    },
    {
        id: "automation",
        name: "Aila Automation",
        href: "/products/automation",
        icon: Bot,
        status: "live",
        description: "Workflow automation platform.",
    },
    {
        id: "sites",
        name: "Aila Sites",
        href: "/products/sites",
        icon: Globe,
        status: "live",
        description: "Website platform.",
    },
    {
        id: "apps",
        name: "Aila Apps",
        href: "/products/apps",
        icon: AppWindow,
        status: "live",
        description: "Application development.",
    },
    {
        id: "flow",
        name: "Aila Flow",
        href: "/products/flow",
        icon: GitBranch,
        status: "live",
        description: "Business process management.",
    },

    // BUILDING PRODUCTS

    {
        id: "coding",
        name: "Aila Coding",
        href: "/products/coding",
        icon: Code2,
        status: "building",
        description: "AI software engineering.",
    },
    {
        id: "health",
        name: "Aila Health",
        href: "/products/health",
        icon: HeartPulse,
        status: "building",
        description: "Healthcare intelligence.",
    },
    {
        id: "shipping",
        name: "Aila Shipping",
        href: "/products/shipping",
        icon: Truck,
        status: "building",
        description: "Global logistics platform.",
    },
    {
        id: "commerce",
        name: "Aila Commerce",
        href: "/products/commerce",
        icon: ShoppingCart,
        status: "building",
        description: "Commerce operating system.",
    },
    {
        id: "finance",
        name: "Aila Finance",
        href: "/products/finance",
        icon: Landmark,
        status: "building",
        description: "Financial intelligence platform.",
    },
    {
        id: "crm",
        name: "Aila CRM",
        href: "/products/crm",
        icon: Users,
        status: "building",
        description: "Customer relationship platform.",
    },
    {
        id: "analytics",
        name: "Aila Analytics",
        href: "/products/analytics",
        icon: BarChart3,
        status: "building",
        description: "Business analytics.",
    },
    {
        id: "ads",
        name: "Aila Ads",
        href: "/products/ads",
        icon: Megaphone,
        status: "building",
        description: "Advertising platform.",
    },
    {
        id: "social",
        name: "Aila Social",
        href: "/products/social",
        icon: Share2,
        status: "building",
        description: "Social media platform.",
    },
    {
        id: "cloud",
        name: "Aila Cloud",
        href: "/products/cloud",
        icon: Cloud,
        status: "building",
        description: "Cloud infrastructure.",
    },
    {
        id: "files",
        name: "Aila Files",
        href: "/products/files",
        icon: Folder,
        status: "building",
        description: "Enterprise file management.",
    },
    {
        id: "calendar",
        name: "Aila Calendar",
        href: "/products/calendar",
        icon: Calendar,
        status: "building",
        description: "Scheduling platform.",
    },
    {
        id: "email",
        name: "Aila Mail",
        href: "/products/email",
        icon: Mail,
        status: "building",
        description: "Enterprise mail.",
    },
    {
        id: "meetings",
        name: "Aila Meetings",
        href: "/products/meetings",
        icon: Video,
        status: "building",
        description: "Video meetings.",
    },
    {
        id: "api",
        name: "Aila API",
        href: "/products/api",
        icon: KeyRound,
        status: "building",
        description: "Developer APIs.",
    },
    {
        id: "developer",
        name: "Aila Developer",
        href: "/products/developer",
        icon: Wrench,
        status: "building",
        description: "Developer workspace.",
    },
    {
        id: "education",
        name: "Aila Education",
        href: "/products/education",
        icon: GraduationCap,
        status: "building",
        description: "Education and learning platform.",
    },
    {
        id: "ui-ux",
        name: "Aila UI/UX",
        href: "/products/ui-ux",
        icon: Palette,
        status: "building",
        description: "Design system and UI/UX platform.",
    },

    // SYSTEM

    {
        id: "settings",
        name: "Settings",
        href: "/settings",
        icon: Settings,
        status: "system",
        description: "Platform settings.",
    },
];

// Product icon sets (registered from product foundations)
export { CommerceIcons } from "@/products/Aila_Commerce/icons";
export { FinanceIcons } from "@/products/Aila_Finance/icons";
export { SocialIcons } from "@/products/Aila_Social/icons";
export { AdsIcons } from "@/products/Aila_Ads/icons";
export { EducationIcons } from "@/products/Aila_Education/icons";
export { ShippingIcons } from "@/products/Aila_Shipping/icons";
export { DeveloperIcons } from "@/products/Aila_Developer/icons";
export { ApiIcons } from "@/products/Aila_API/icons";
export { UIUXIcons } from "@/products/Aila_UI_UX/icons";
