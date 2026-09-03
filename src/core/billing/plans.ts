/**
 * Paystack plan catalog and environment helpers for Aila Pro.
 *
 * Amounts are in kobo (₦1 = 100 kobo). Plan codes come from the live
 * Paystack dashboard via environment variables — never hard-code secrets.
 */

import { getOptionalSecret } from "@/lib/config/env";
import type { UserRole } from "@/types/auth";

export const BILLING_PLAN_IDS = ["free", "pro", "business", "enterprise"] as const;

export type BillingPlanId = (typeof BILLING_PLAN_IDS)[number];

export type BillingPlanGrant = "default" | "paystack" | "clerk_role";

export type PaystackPlanInterval = "monthly" | "annually";

export type BillingPlanDefinition = {
  readonly id: BillingPlanId;
  readonly name: string;
  readonly purchasable: boolean;
  readonly grant: BillingPlanGrant;
  readonly trialDays: number | null;
  readonly summary: string;
  readonly includes: readonly string[];
};

export type PaystackCheckoutPlan = {
  readonly interval: PaystackPlanInterval;
  readonly label: string;
  readonly amountNgn: number;
  readonly amountKobo: number;
  readonly periodLabel: string;
  readonly envKey: "PAYSTACK_PLAN_CODE_MONTHLY" | "PAYSTACK_PLAN_CODE_YEARLY";
};

export const PAYSTACK_BILLING_PLAN: Extract<BillingPlanId, "pro"> = "pro";

/** Live Aila Pro pricing (NGN). */
export const PAYSTACK_CHECKOUT_PLANS: readonly PaystackCheckoutPlan[] = [
  {
    interval: "monthly",
    label: "Aila Pro Monthly",
    amountNgn: 15_000,
    amountKobo: 1_500_000,
    periodLabel: "per month",
    envKey: "PAYSTACK_PLAN_CODE_MONTHLY",
  },
  {
    interval: "annually",
    label: "Aila Pro Yearly",
    amountNgn: 150_000,
    amountKobo: 15_000_000,
    periodLabel: "per year",
    envKey: "PAYSTACK_PLAN_CODE_YEARLY",
  },
] as const;

export const BILLING_PLANS: readonly BillingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    purchasable: false,
    grant: "default",
    trialDays: null,
    summary:
      "A real everyday workspace. Intelligence, Daily, Writer, Translate, Documents, and Ads stay available without a card.",
    includes: [
      "Aila Intelligence conversations and file attachments",
      "Aila Daily briefing from your stored work",
      "Aila Writer, Translate, and Documents",
      "Aila Ads campaign planning with Free limits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    purchasable: true,
    grant: "paystack",
    trialDays: null,
    summary:
      "Unlock paid workspaces with a live Paystack subscription — ₦15,000/month or ₦150,000/year.",
    includes: [
      "Legal, Business, Automation, Coding, Career, Education, Health, Finance, Travel, Commerce, Shipping, Calendar, Sites, Apps, and Flow",
      "Higher Aila Ads limits",
      "Recurring Paystack billing with manage/cancel via Paystack",
    ],
  },
  {
    id: "business",
    name: "Business",
    purchasable: false,
    grant: "clerk_role",
    trialDays: null,
    summary:
      "Granted through a Clerk Business role. No self-serve Business checkout is configured.",
    includes: ["Everything in Pro", "Business Aila Ads limits"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    purchasable: false,
    grant: "clerk_role",
    trialDays: null,
    summary:
      "Granted through a Clerk Enterprise or Admin role. No self-serve Enterprise checkout is configured.",
    includes: ["Everything in Business", "Enterprise Aila Ads limits"],
  },
];

export function getPaystackSecretKey(): string | undefined {
  return getOptionalSecret("PAYSTACK_SECRET_KEY");
}

export function getPaystackPublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() ||
    getOptionalSecret("PAYSTACK_PUBLIC_KEY")
  );
}

export function getPaystackPlanCodeMonthly(): string | undefined {
  return getOptionalSecret("PAYSTACK_PLAN_CODE_MONTHLY");
}

export function getPaystackPlanCodeYearly(): string | undefined {
  return getOptionalSecret("PAYSTACK_PLAN_CODE_YEARLY");
}

export function getPaystackPlanCode(interval: PaystackPlanInterval): string | undefined {
  return interval === "annually"
    ? getPaystackPlanCodeYearly()
    : getPaystackPlanCodeMonthly();
}

export function paystackCheckoutPlan(
  interval: PaystackPlanInterval,
): PaystackCheckoutPlan {
  const plan = PAYSTACK_CHECKOUT_PLANS.find((entry) => entry.interval === interval);
  if (!plan) {
    throw new Error(`Unknown Paystack interval: ${interval}`);
  }
  return plan;
}

export function isPaystackBillingConfigured(): boolean {
  return Boolean(
    getPaystackSecretKey() &&
      getPaystackPlanCodeMonthly() &&
      getPaystackPlanCodeYearly(),
  );
}

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
