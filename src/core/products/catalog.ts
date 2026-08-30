import type { AilaMode } from "@/core/types";

/**
 * Canonical registry of products that actually exist in this repository.
 *
 * Documents, Writer, Translate, Coding, Career, Education, Health,
 * Finance, Travel, Ship, and Salon are not implemented here — they are not
 * registered, linked, or stubbed.
 */

export const PRODUCT_KEYS = [
  "intelligence",
  "daily",
  "business",
  "ads",
  "ailalegal",
  "automation",
  "commerce",
  "calendar",
  "sites",
  "apps",
  "flow",
] as const;

export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const PRODUCT_GROUP_ORDER = [
  "everyday",
  "professional",
  "life",
  "commerce",
  "supporting",
] as const;

export type ProductGroup = (typeof PRODUCT_GROUP_ORDER)[number];

export const PRODUCT_GROUP_LABELS: Record<ProductGroup, string> = {
  everyday: "Everyday core",
  professional: "Professional",
  life: "Life",
  commerce: "Commerce & operations",
  supporting: "More",
};

export type ProductDefinition = {
  readonly key: ProductKey;
  readonly title: string;
  readonly href: `/${string}`;
  readonly aiMode: AilaMode;
  readonly paid: boolean;
  readonly group: ProductGroup;
  readonly description: string;
};

export const PRODUCTS: Record<ProductKey, ProductDefinition> = {
  intelligence: {
    key: "intelligence",
    title: "Aila Intelligence",
    href: "/products/intelligence",
    aiMode: "intelligence",
    paid: false,
    group: "everyday",
    description:
      "The intelligence layer of the ecosystem. Chat, attach files, and persist conversations on your account.",
  },
  daily: {
    key: "daily",
    title: "Aila Daily",
    href: "/products/daily",
    aiMode: "daily",
    paid: false,
    group: "everyday",
    description:
      "Plan the day from your stored tasks, notes, goals, calendar, conversations, and campaigns.",
  },
  business: {
    key: "business",
    title: "Aila Business",
    href: "/products/business",
    aiMode: "business",
    paid: true,
    group: "professional",
    description: "Contacts, tasks, and completed work stored on your account.",
  },
  ads: {
    key: "ads",
    title: "Aila Ads",
    href: "/products/ads",
    aiMode: "ads",
    paid: false,
    group: "professional",
    description:
      "Plan campaigns, generate ad copy, and analyse stored campaign data. Live platform metrics appear only after a real ad-network connection.",
  },
  ailalegal: {
    key: "ailalegal",
    title: "Aila Legal",
    href: "/products/ailalegal",
    aiMode: "legal",
    paid: true,
    group: "professional",
    description:
      "Legal document analysis and legal-mode chat. Uploads are stored on your account and analyzed through OpenRouter.",
  },
  automation: {
    key: "automation",
    title: "Aila Automation",
    href: "/products/automation",
    aiMode: "automation",
    paid: true,
    group: "professional",
    description:
      "Rules that send email, create calendar events, or create tasks. Run them now or on an interval.",
  },
  commerce: {
    key: "commerce",
    title: "Aila Commerce",
    href: "/products/commerce",
    aiMode: "commerce",
    paid: true,
    group: "commerce",
    description:
      "Create products, take orders, and collect payment through Stripe Checkout.",
  },
  calendar: {
    key: "calendar",
    title: "Aila Calendar",
    href: "/products/calendar",
    aiMode: "calendar",
    paid: true,
    group: "supporting",
    description: "Create, search, edit, and archive events stored on your account.",
  },
  sites: {
    key: "sites",
    title: "Aila Sites",
    href: "/products/sites",
    aiMode: "sites",
    paid: true,
    group: "supporting",
    description: "Write markdown pages and publish them to a public Aila URL.",
  },
  apps: {
    key: "apps",
    title: "Aila Apps",
    href: "/products/apps",
    aiMode: "apps",
    paid: true,
    group: "supporting",
    description: "Describe, draft, and publish app listings on your account.",
  },
  flow: {
    key: "flow",
    title: "Aila Flow",
    href: "/products/flow",
    aiMode: "flow",
    paid: true,
    group: "supporting",
    description: "Define ordered steps and complete the next one as the work moves.",
  },
};

export const PRODUCT_LIST: readonly ProductDefinition[] = PRODUCT_KEYS.map(
  (key) => PRODUCTS[key],
);

export const PAID_PRODUCT_KEYS = PRODUCT_KEYS.filter(
  (key) => PRODUCTS[key].paid,
) as readonly ProductKey[];

export type GroupedCatalog = {
  readonly group: ProductGroup;
  readonly label: string;
  readonly products: readonly ProductDefinition[];
};

export function groupedCatalogProducts(): readonly GroupedCatalog[] {
  return PRODUCT_GROUP_ORDER.map((group) => ({
    group,
    label: PRODUCT_GROUP_LABELS[group],
    products: PRODUCT_LIST.filter((product) => product.group === group),
  })).filter((entry) => entry.products.length > 0);
}

const MODE_TO_PRODUCT: Record<AilaMode, ProductKey> = {
  intelligence: "intelligence",
  daily: "daily",
  legal: "ailalegal",
  business: "business",
  automation: "automation",
  ads: "ads",
  apps: "apps",
  calendar: "calendar",
  commerce: "commerce",
  flow: "flow",
  sites: "sites",
};

export function isProductKey(value: string): value is ProductKey {
  return (PRODUCT_KEYS as readonly string[]).includes(value);
}

export function productKeyFromMode(mode: AilaMode): ProductKey {
  return MODE_TO_PRODUCT[mode];
}

export function isPaidProduct(product: ProductKey): boolean {
  return PRODUCTS[product].paid;
}
