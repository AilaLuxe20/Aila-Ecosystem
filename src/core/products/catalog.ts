import type { AilaMode } from "@/core/types";

/**
 * Canonical registry of products that actually exist in this repository.
 *
 * Coding, Health, Shipping, Education, Ride, and Salon are not implemented
 * here — they are not registered, linked, or stubbed.
 */

export const PRODUCT_KEYS = [
  "intelligence",
  "ailalegal",
  "business",
  "automation",
  "commerce",
  "ads",
  "calendar",
  "sites",
  "apps",
  "flow",
] as const;

export type ProductKey = (typeof PRODUCT_KEYS)[number];

export type ProductDefinition = {
  readonly key: ProductKey;
  readonly title: string;
  readonly href: `/${string}`;
  readonly aiMode: AilaMode;
  readonly paid: boolean;
  readonly description: string;
};

export const PRODUCTS: Record<ProductKey, ProductDefinition> = {
  intelligence: {
    key: "intelligence",
    title: "Aila Intelligence",
    href: "/products/intelligence",
    aiMode: "intelligence",
    paid: false,
    description:
      "The intelligence layer of the ecosystem. Chat, attach files, and persist conversations on your account.",
  },
  ailalegal: {
    key: "ailalegal",
    title: "Aila Legal",
    href: "/products/ailalegal",
    aiMode: "legal",
    paid: true,
    description:
      "Legal document analysis and legal-mode chat. Uploads are stored on your account and analyzed through OpenRouter.",
  },
  business: {
    key: "business",
    title: "Aila Business",
    href: "/products/business",
    aiMode: "business",
    paid: true,
    description: "Contacts, tasks, and completed work stored on your account.",
  },
  automation: {
    key: "automation",
    title: "Aila Automation",
    href: "/products/automation",
    aiMode: "automation",
    paid: true,
    description:
      "Rules that send email, create calendar events, or create tasks. Run them now or on an interval.",
  },
  commerce: {
    key: "commerce",
    title: "Aila Commerce",
    href: "/products/commerce",
    aiMode: "commerce",
    paid: true,
    description:
      "Create products, take orders, and collect payment through Stripe Checkout.",
  },
  ads: {
    key: "ads",
    title: "Aila Ads",
    href: "/products/ads",
    aiMode: "ads",
    paid: true,
    description: "Plan, launch, pause, and end advertising campaigns.",
  },
  calendar: {
    key: "calendar",
    title: "Aila Calendar",
    href: "/products/calendar",
    aiMode: "calendar",
    paid: true,
    description: "Create, search, edit, and archive events stored on your account.",
  },
  sites: {
    key: "sites",
    title: "Aila Sites",
    href: "/products/sites",
    aiMode: "sites",
    paid: true,
    description: "Write markdown pages and publish them to a public Aila URL.",
  },
  apps: {
    key: "apps",
    title: "Aila Apps",
    href: "/products/apps",
    aiMode: "apps",
    paid: true,
    description: "Describe, draft, and publish app listings on your account.",
  },
  flow: {
    key: "flow",
    title: "Aila Flow",
    href: "/products/flow",
    aiMode: "flow",
    paid: true,
    description: "Define ordered steps and complete the next one as the work moves.",
  },
};

export const PRODUCT_LIST: readonly ProductDefinition[] = PRODUCT_KEYS.map(
  (key) => PRODUCTS[key],
);

export const PAID_PRODUCT_KEYS = PRODUCT_KEYS.filter(
  (key) => PRODUCTS[key].paid,
) as readonly ProductKey[];

const MODE_TO_PRODUCT: Record<AilaMode, ProductKey> = {
  intelligence: "intelligence",
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
