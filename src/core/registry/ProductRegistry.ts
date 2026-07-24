import { registerProduct } from "../product-registry";
import type {
    ProductRegistration,
    ProductMetadata,
} from "../product-registry";
import type { ProductManifest } from "../products/ProductManifest";

// Import manifests
import commerceManifest from "@/products/Aila_Commerce/manifest";
import financeManifest from "@/products/Aila_Finance/manifest";
import socialManifest from "@/products/Aila_Social/manifest";
import adsManifest from "@/products/Aila_Ads/manifest";
import educationManifest from "@/products/Aila_Education/manifest";
import shippingManifest from "@/products/Aila_Shipping/manifest";
import developerManifest from "@/products/Aila_Developer/manifest";
import apiManifest from "@/products/Aila_API/manifest";
import uiUxManifest from "@/products/Aila_UI_UX/manifest";

// Import metadata
import commerceMetadata from "@/products/Aila_Commerce/metadata";
import financeMetadata from "@/products/Aila_Finance/metadata";
import socialMetadata from "@/products/Aila_Social/metadata";
import adsMetadata from "@/products/Aila_Ads/metadata";
import educationMetadata from "@/products/Aila_Education/metadata";
import shippingMetadata from "@/products/Aila_Shipping/metadata";
import developerMetadata from "@/products/Aila_Developer/metadata";
import apiMetadata from "@/products/Aila_API/metadata";
import uiUxMetadata from "@/products/Aila_UI_UX/metadata";

// Import icon sets
import { CommerceIcons } from "@/products/Aila_Commerce/icons";
import { FinanceIcons } from "@/products/Aila_Finance/icons";
import { SocialIcons } from "@/products/Aila_Social/icons";
import { AdsIcons } from "@/products/Aila_Ads/icons";
import { EducationIcons } from "@/products/Aila_Education/icons";
import { ShippingIcons } from "@/products/Aila_Shipping/icons";
import { DeveloperIcons } from "@/products/Aila_Developer/icons";
import { ApiIcons } from "@/products/Aila_API/icons";
import { UIUXIcons } from "@/products/Aila_UI_UX/icons";

// Helper to convert product id to PascalCase page component name
function toPageComponent(id: string): string {
    return (
        id
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("") + "Page"
    );
}

// Helper to build a full ProductRegistration from manifest + metadata
function buildRegistration(
    manifest: ProductManifest,
    metadata: ProductMetadata
): ProductRegistration {
    return {
        manifest,
        metadata,
        navigation: {
            id: manifest.id,
            label: manifest.name,
            href: manifest.route,
            icon: manifest.icon!,
            order: 1,
            visible: manifest.enabled,
        },
        workspace: {
            id: `${manifest.id}-workspace`,
            productId: manifest.id,
            title: manifest.name,
            description: manifest.description,
            route: manifest.route,
            widgets: metadata.capabilities,
            navigation: [{ label: "Overview", href: manifest.route }],
        },
        route: {
            productId: manifest.id,
            route: manifest.route,
            pageComponent: toPageComponent(manifest.id),
        },
    };
}

// Register all product foundations
registerProduct(buildRegistration(commerceManifest, commerceMetadata));
registerProduct(buildRegistration(financeManifest, financeMetadata));
registerProduct(buildRegistration(socialManifest, socialMetadata));
registerProduct(buildRegistration(adsManifest, adsMetadata));
registerProduct(buildRegistration(educationManifest, educationMetadata));
registerProduct(buildRegistration(shippingManifest, shippingMetadata));
registerProduct(buildRegistration(developerManifest, developerMetadata));
registerProduct(buildRegistration(apiManifest, apiMetadata));
registerProduct(buildRegistration(uiUxManifest, uiUxMetadata));

// Export icon sets for use across the platform
export {
    CommerceIcons,
    FinanceIcons,
    SocialIcons,
    AdsIcons,
    EducationIcons,
    ShippingIcons,
    DeveloperIcons,
    ApiIcons,
    UIUXIcons,
};
