import type { BillingPlanId } from "./plans";
import type { ProductKey } from "@/core/products/catalog";

export type BillingStatus = {
  plan: BillingPlanId;
  planLabel: string;
  status: string | null;
  trialing: boolean;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  trialEligible: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  stripeConfigured: boolean;
  priceConfigured: boolean;
  entitledProductKeys: ProductKey[];
};
