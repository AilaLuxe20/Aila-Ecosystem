import type { UserRole } from "@/types/auth";

export const BILLING_PLAN_IDS = ["free", "pro", "business", "enterprise"] as const;

export type BillingPlanId = (typeof BILLING_PLAN_IDS)[number];

export type BillingPlanGrant = "default" | "stripe" | "clerk_role";

export type BillingPlanDefinition = {
  readonly id: BillingPlanId;
  readonly name: string;
  readonly purchasable: boolean;
  readonly grant: BillingPlanGrant;
  readonly trialDays: number | null;
  readonly stripePriceEnv: "STRIPE_PRICE_PRO" | null;
  readonly summary: string;
  readonly includes: readonly string[];
};

export const STRIPE_TRIAL_DAYS = 7;
export const STRIPE_BILLING_PLAN: Extract<BillingPlanId, "pro"> = "pro";

/**
 * Canonical commercial plans. Amounts and currencies live on the Stripe price
 * (`STRIPE_PRICE_PRO`). Business and Enterprise are Clerk staff grants — they
 * are not separate Stripe products in this repository.
 */
export const BILLING_PLANS: readonly BillingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    purchasable: false,
    grant: "default",
    trialDays: null,
    stripePriceEnv: null,
    summary:
      "A real everyday workspace. Intelligence, Daily, and Ads stay available without a card.",
    includes: [
      "Aila Intelligence conversations and file attachments",
      "Aila Daily briefing from your stored work",
      "Aila Ads campaign planning with Free limits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    purchasable: true,
    grant: "stripe",
    trialDays: STRIPE_TRIAL_DAYS,
    stripePriceEnv: "STRIPE_PRICE_PRO",
    summary:
      "Unlock paid workspaces. Checkout uses the Stripe price in STRIPE_PRICE_PRO, including that price's currency.",
    includes: [
      "Legal, Business, Automation, Commerce, Calendar, Sites, Apps, and Flow",
      "Higher Aila Ads limits",
      `${STRIPE_TRIAL_DAYS}-day Stripe trial on first Pro checkout`,
    ],
  },
  {
    id: "business",
    name: "Business",
    purchasable: false,
    grant: "clerk_role",
    trialDays: null,
    stripePriceEnv: null,
    summary:
      "Granted through a Clerk Business role. No self-serve Stripe Business price is configured.",
    includes: ["Everything in Pro", "Business Aila Ads limits"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    purchasable: false,
    grant: "clerk_role",
    trialDays: null,
    stripePriceEnv: null,
    summary:
      "Granted through a Clerk Enterprise or Admin role. No self-serve Stripe Enterprise price is configured.",
    includes: ["Everything in Business", "Enterprise Aila Ads limits"],
  },
];

export function billingPlanById(id: BillingPlanId): BillingPlanDefinition {
  const plan = BILLING_PLANS.find((entry) => entry.id === id);
  if (!plan) {
    throw new Error(`Unknown billing plan: ${id}`);
  }
  return plan;
}

export function resolveBillingPlanId(
  role: UserRole,
  hasActiveSubscription: boolean,
): BillingPlanId {
  if (role === "admin" || role === "enterprise") {
    return "enterprise";
  }

  if (role === "business") {
    return "business";
  }

  if (role === "pro" || hasActiveSubscription) {
    return "pro";
  }

  return "free";
}
