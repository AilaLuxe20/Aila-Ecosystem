import { userHasActiveSubscription } from "@/core/billing/entitlements";
import { getActorRole } from "@/lib/auth/require-product-access";
import { requireWorkspaceUser } from "@/core/workspace/http";

import { ADS_QUOTAS, resolveAdsPlan, type AdsPlan } from "./plan";

export type AdsActor = {
  userId: string;
  plan: AdsPlan;
};

export async function requireAdsActor(): Promise<AdsActor> {
  const user = await requireWorkspaceUser("ads");
  const role = (await getActorRole()) ?? "user";
  const hasActiveSubscription = await userHasActiveSubscription(user.id);
  const plan = resolveAdsPlan(role, hasActiveSubscription);

  return {
    userId: user.id,
    plan,
  };
}

export function adsQuotasFor(plan: AdsPlan) {
  return ADS_QUOTAS[plan];
}
