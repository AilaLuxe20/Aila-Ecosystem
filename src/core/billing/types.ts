import type { ProductKey } from "@/core/products/catalog";

export type BillingStatus = {
  plan: "free" | "pro";
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  stripeConfigured: boolean;
  priceConfigured: boolean;
  entitledProductKeys: ProductKey[];
};
