import type { AilaMode } from "@/core/types";

/**
 * Canonical registry of products that actually exist in this repository.
 *
 * Salon is not implemented and is not registered.
 */

export const PRODUCT_KEYS = [
  "intelligence",
  "daily",
  "writer",
  "translate",
  "documents",
  "business",
  "ads",
  "ailalegal",
  "automation",
  "coding",
  "career",
  "education",
  "health",
  "finance",
  "travel",
  "commerce",
  "shipping",
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
  writer: {
    key: "writer",
    title: "Aila Writer",
    href: "/products/writer",
    aiMode: "writer",
    paid: false,
    group: "everyday",
    description: "Write, edit, and rewrite documents stored on your account.",
  },
  translate: {
    key: "translate",
    title: "Aila Translate",
    href: "/products/translate",
    aiMode: "translate",
    paid: false,
    group: "everyday",
    description: "Translate text between languages and keep a private history.",
  },
  documents: {
    key: "documents",
    title: "Aila Documents",
    href: "/products/documents",
    aiMode: "documents",
    paid: false,
    group: "everyday",
    description: "Upload files, extract text, search, and keep notes on your documents.",
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
  coding: {
    key: "coding",
    title: "Aila Coding",
    href: "/products/coding",
    aiMode: "coding",
    paid: true,
    group: "professional",
    description: "A coding workspace with project files, editing, and AI help to explain code.",
  },
  career: {
    key: "career",
    title: "Aila Career",
    href: "/products/career",
    aiMode: "career",
    paid: true,
    group: "professional",
    description: "Resumes, job applications, and interview notes stored on your account.",
  },
  education: {
    key: "education",
    title: "Aila Education",
    href: "/products/education",
    aiMode: "education",
    paid: true,
    group: "life",
    description: "Courses, study notes, quizzes, and progress stored on your account.",
  },
  health: {
    key: "health",
    title: "Aila Health",
    href: "/products/health",
    aiMode: "health",
    paid: true,
    group: "life",
    description:
      "Habits, wellness notes, and reminders. This is not medical care and does not diagnose.",
  },
  finance: {
    key: "finance",
    title: "Aila Finance",
    href: "/products/finance",
    aiMode: "finance",
    paid: true,
    group: "life",
    description: "Track income, expenses, budgets, and goals. No bank connection.",
  },
  travel: {
    key: "travel",
    title: "Aila Travel",
    href: "/products/travel",
    aiMode: "travel",
    paid: true,
    group: "life",
    description: "Plan trips, itineraries, and reservation notes. Aila does not book travel.",
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
  shipping: {
    key: "shipping",
    title: "Aila Shipping",
    href: "/products/shipping",
    aiMode: "shipping",
    paid: true,
    group: "commerce",
    description:
      "Create shipment records, statuses, and tracking numbers you enter. Carrier live tracking is not connected.",
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
  writer: "writer",
  translate: "translate",
  documents: "documents",
  coding: "coding",
  education: "education",
  career: "career",
  health: "health",
  finance: "finance",
  travel: "travel",
  shipping: "shipping",
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
