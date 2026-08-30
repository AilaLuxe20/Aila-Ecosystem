import type { UserRole } from "@/types/auth";

import { prisma } from "@/core/database/prisma";
import {
  isPaidProduct,
  type ProductKey,
} from "@/core/products/catalog";

/** Stripe subscription statuses that still grant paid product access. */
export const ACTIVE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
] as const;

const STAFF_ROLES: ReadonlySet<UserRole> = new Set([
  "admin",
  "enterprise",
  "business",
]);

export type EntitlementDecision = {
  readonly allowed: boolean;
  readonly reason:
    | "staff"
    | "free_product"
    | "active_subscription"
    | "clerk_pro"
    | "development"
    | "unauthenticated"
    | "subscription_required";
};

/** Local `next dev` only — production and preview stay subscription-gated. */
export function isLocalProductUnlockEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isActiveSubscriptionStatus(status: string): boolean {
  return (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
}

/**
 * Resolves whether a signed-in role + subscription may use a product.
 *
 * Staff roles granted in Clerk can access paid products without a Stripe
 * subscription. Everyone else needs an active subscription for paid products.
 * Intelligence stays available to any authenticated user.
 */
export function evaluateEntitlement(
  role: UserRole | null,
  product: ProductKey,
  hasActiveSubscription: boolean,
): EntitlementDecision {
  if (!role || role === "guest") {
    return { allowed: false, reason: "unauthenticated" };
  }

  if (STAFF_ROLES.has(role)) {
    return { allowed: true, reason: "staff" };
  }

  if (!isPaidProduct(product)) {
    return { allowed: true, reason: "free_product" };
  }

  if (hasActiveSubscription) {
    return { allowed: true, reason: "active_subscription" };
  }

  if (role === "pro") {
    return { allowed: true, reason: "clerk_pro" };
  }

  return { allowed: false, reason: "subscription_required" };
}

export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.billingSubscription.findFirst({
    where: {
      userId,
      status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
    },
    select: { id: true },
  });

  return Boolean(subscription);
}

export async function resolveProductEntitlement(
  userId: string,
  role: UserRole,
  product: ProductKey,
): Promise<EntitlementDecision> {
  if (isLocalProductUnlockEnabled() && role && role !== "guest") {
    return { allowed: true, reason: "development" };
  }

  if (!isPaidProduct(product) || STAFF_ROLES.has(role) || role === "pro") {
    return evaluateEntitlement(role, product, false);
  }

  return evaluateEntitlement(role, product, await userHasActiveSubscription(userId));
}
