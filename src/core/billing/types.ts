import type { BillingPlanId } from "./plans";
import type { ProductKey } from "@/core/products/catalog";

export type BillingStatus = {
  plan: BillingPlanId;
  planLabel: string;
  status: string | null;
  provider: string | null;
  interval: string | null;
  trialing: boolean;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  trialEligible: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  /** @deprecated Use paystackConfigured — kept for existing UI bindings. */
  stripeConfigured: boolean;
  priceConfigured: boolean;
  paystackConfigured: boolean;
  entitledProductKeys: ProductKey[];
};
