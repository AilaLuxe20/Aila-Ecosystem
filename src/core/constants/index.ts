/**
 * Core constants shared across the Aila Ecosystem.
 */

export const SITE_URL = "https://ailaluxe.com";

export const SITE_NAME = "Aila Ecosystem";

export const MAX_MESSAGES = 20;

export const MAX_MESSAGE_LENGTH = 5000;

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
];

/** Intelligence chat attachments. Legal upload limits stay on ALLOWED_FILE_TYPES. */
export const INTELLIGENCE_ALLOWED_EXTENSIONS = [
  "pdf",
  "txt",
  "csv",
  "json",
  "md",
  "markdown",
] as const;

export const MAX_INTELLIGENCE_ATTACHMENTS = 1;

/** Hard cap on stored extracted text. Excess is dropped and flagged. */
export const MAX_EXTRACTED_TEXT_CHARS = 100_000;

/** Maximum characters injected into the model prompt from an attached file. */
export const MAX_DOCUMENT_CONTEXT_CHARS = 8_000;

export const MAX_FILENAME_LENGTH = 255;

export const INTELLIGENCE_EXTRACT_TIMEOUT_MS = 20_000;

export const AI_MODEL = "openai/gpt-4.1-mini";

/** Maximum tool rounds per Intelligence request. Prevents unbounded loops. */
export const MAX_TOOL_ITERATIONS = 3;

export const MODE_CONFIG = {
  intelligence: {
    maxTokens: 700,
    temperature: 0.5,
  },
  daily: {
    maxTokens: 900,
    temperature: 0.4,
  },
  legal: {
    maxTokens: 1400,
    temperature: 0.25,
  },
  business: {
    maxTokens: 1200,
    temperature: 0.6,
  },
  automation: {
    maxTokens: 1400,
    temperature: 0.45,
  },
  ads: {
    maxTokens: 1600,
    temperature: 0.5,
  },
  apps: {
    maxTokens: 1000,
    temperature: 0.45,
  },
  calendar: {
    maxTokens: 700,
    temperature: 0.4,
  },
  commerce: {
    maxTokens: 1000,
    temperature: 0.5,
  },
  flow: {
    maxTokens: 1200,
    temperature: 0.45,
  },
  sites: {
    maxTokens: 900,
    temperature: 0.5,
  },
} as const;

export const PRODUCT_NAVIGATION = [
  {
    name: "Daily",
    mobileName: "Daily",
    href: "/products/daily",
    group: "everyday",
    dot: "bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.9)]",
    activeBorder: "border-sky-300/20",
    activeBackground: "bg-sky-300/[0.08]",
    activeText: "text-sky-100",
  },
  {
    name: "Intelligence",
    mobileName: "AI",
    href: "/products/intelligence",
    group: "everyday",
    dot: "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]",
    activeBorder: "border-cyan-300/20",
    activeBackground: "bg-cyan-300/[0.08]",
    activeText: "text-cyan-100",
  },
  {
    name: "Business",
    mobileName: "Business",
    href: "/products/business",
    group: "professional",
    dot: "bg-purple-300 shadow-[0_0_14px_rgba(216,180,254,0.9)]",
    activeBorder: "border-purple-300/20",
    activeBackground: "bg-purple-300/[0.08]",
    activeText: "text-purple-100",
  },
  {
    name: "Ads",
    mobileName: "Ads",
    href: "/products/ads",
    group: "professional",
    dot: "bg-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.9)]",
    activeBorder: "border-amber-300/20",
    activeBackground: "bg-amber-300/[0.08]",
    activeText: "text-amber-100",
  },
  {
    name: "Legal",
    mobileName: "Legal",
    href: "/products/ailalegal",
    group: "professional",
    dot: "bg-blue-300 shadow-[0_0_14px_rgba(147,197,253,0.9)]",
    activeBorder: "border-blue-300/20",
    activeBackground: "bg-blue-300/[0.08]",
    activeText: "text-blue-100",
  },
  {
    name: "Automation",
    mobileName: "Auto",
    href: "/products/automation",
    group: "professional",
    dot: "bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.9)]",
    activeBorder: "border-violet-300/20",
    activeBackground: "bg-violet-300/[0.08]",
    activeText: "text-violet-100",
  },
] as const;

export const PLATFORM_NAVIGATION = [
  {
    name: "Commerce",
    mobileName: "Com",
    href: "/products/commerce",
    group: "commerce",
    dot: "bg-emerald-300 shadow-[0_0_14px_rgba(34,197,94,0.9)]",
    activeBorder: "border-emerald-300/20",
    activeBackground: "bg-emerald-300/[0.08]",
    activeText: "text-emerald-100",
  },
  {
    name: "Calendar",
    mobileName: "Cal",
    href: "/products/calendar",
    group: "supporting",
    dot: "bg-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
    activeBorder: "border-rose-300/20",
    activeBackground: "bg-rose-300/[0.08]",
    activeText: "text-rose-100",
  },
  {
    name: "Sites",
    mobileName: "Sites",
    href: "/products/sites",
    group: "supporting",
    dot: "bg-teal-300 shadow-[0_0_14px_rgba(20,181,169,0.9)]",
    activeBorder: "border-teal-300/20",
    activeBackground: "bg-teal-300/[0.08]",
    activeText: "text-teal-100",
  },
  {
    name: "Apps",
    mobileName: "Apps",
    href: "/products/apps",
    group: "supporting",
    dot: "bg-indigo-300 shadow-[0_0_14px_rgba(129,140,249,0.9)]",
    activeBorder: "border-indigo-300/20",
    activeBackground: "bg-indigo-300/[0.08]",
    activeText: "text-indigo-100",
  },
  {
    name: "Flow",
    mobileName: "Flow",
    href: "/products/flow",
    group: "supporting",
    dot: "bg-fuchsia-300 shadow-[0_0_14px_rgba(217,70,239,0.9)]",
    activeBorder: "border-fuchsia-300/20",
    activeBackground: "bg-fuchsia-300/[0.08]",
    activeText: "text-fuchsia-100",
  },
] as const;

export const ALL_PRODUCTS = [...PRODUCT_NAVIGATION, ...PLATFORM_NAVIGATION];

export const NAV_GROUP_ORDER = ["everyday", "professional", "commerce", "supporting"] as const;

export const NAV_GROUP_LABELS = {
  everyday: "Everyday core",
  professional: "Professional",
  commerce: "Commerce & operations",
  supporting: "More",
} as const;

export function groupedNavProducts() {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    products: ALL_PRODUCTS.filter((product) => product.group === group),
  }));
}

export const PROJECT_TYPES = [
  "Website",
  "Web App",
  "Mobile App",
  "AI Solution",
  "Automation",
] as const;
