import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { getAppUrl, getStripeProPriceId, getStripeSecretKey } from "@/core/config";
import { prisma } from "@/core/database/prisma";
import { PRODUCT_KEYS, PRODUCTS, isProductKey } from "@/core/products/catalog";
import {
  ConfigurationError,
  NotFoundError,
} from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import type { UserRole } from "@/types/auth";

import {
  evaluateEntitlement,
  isActiveSubscriptionStatus,
  isLocalProductUnlockEnabled,
} from "./entitlements";
import type { BillingStatus } from "./types";

export type { BillingStatus } from "./types";

const log = createLogger("billing");

export const BILLING_PLAN = "pro";
export const CHECKOUT_KIND_SUBSCRIPTION = "subscription";
export const CHECKOUT_KIND_COMMERCE = "commerce_order";

function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new ConfigurationError({
      message: "STRIPE_SECRET_KEY is not configured.",
    });
  }
  return new Stripe(key);
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripeProPriceId());
}

function periodEndFromSubscription(subscription: Stripe.Subscription): Date | null {
  const item = subscription.items.data[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;
  if (typeof item?.current_period_end === "number") {
    return new Date(item.current_period_end * 1000);
  }

  const root = subscription as Stripe.Subscription & { current_period_end?: number };
  if (typeof root.current_period_end === "number") {
    return new Date(root.current_period_end * 1000);
  }

  return null;
}

async function clerkUserIdForPrismaUser(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "clerk" },
    select: { providerAccountId: true },
  });
  return account?.providerAccountId ?? null;
}

async function syncClerkRole(userId: string, role: Extract<UserRole, "user" | "pro">) {
  const clerkUserId = await clerkUserIdForPrismaUser(userId);
  if (!clerkUserId) return;

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role },
    });
  } catch (error) {
    log.warn("Unable to sync Clerk billing role.", {
      userId,
      role,
      error: error instanceof Error ? error.name : "unknown",
    });
  }
}

export async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  userId: string,
) {
  const price = subscription.items.data[0]?.price;
  const record = await prisma.billingSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: price?.id ?? getStripeProPriceId() ?? "unknown",
      stripeProductId: typeof price?.product === "string" ? price.product : null,
      plan: BILLING_PLAN,
      status: subscription.status,
      currentPeriodEnd: periodEndFromSubscription(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      userId,
      stripePriceId: price?.id ?? undefined,
      stripeProductId: typeof price?.product === "string" ? price.product : undefined,
      status: subscription.status,
      currentPeriodEnd: periodEndFromSubscription(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  await syncClerkRole(
    userId,
    isActiveSubscriptionStatus(subscription.status) ? "pro" : "user",
  );

  return record;
}

export async function markSubscriptionDeleted(stripeSubscriptionId: string) {
  const existing = await prisma.billingSubscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!existing) return null;

  const record = await prisma.billingSubscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
    },
  });

  await syncClerkRole(existing.userId, "user");
  return record;
}

async function ensureStripeCustomer(user: {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createProCheckoutSession(user: {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
}, product?: string | null) {
  const priceId = getStripeProPriceId();
  if (!priceId) {
    throw new ConfigurationError({
      message: "STRIPE_PRICE_PRO is not configured.",
    });
  }

  const requestedProduct =
    product && isProductKey(product) ? PRODUCTS[product] : null;
  const customerId = await ensureStripeCustomer(user);
  const stripe = getStripe();
  const successPath = requestedProduct
    ? `${requestedProduct.href}?billing=success`
    : "/billing?checkout=success";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}${successPath}`,
    cancel_url: `${getAppUrl()}/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      kind: CHECKOUT_KIND_SUBSCRIPTION,
      userId: user.id,
      product: requestedProduct?.key ?? "",
    },
    subscription_data: {
      metadata: {
        kind: CHECKOUT_KIND_SUBSCRIPTION,
        userId: user.id,
      },
    },
  });

  if (!session.url) {
    throw new ConfigurationError({
      message: "Stripe did not return a checkout URL.",
    });
  }

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(user: {
  id: string;
  stripeCustomerId: string | null;
}) {
  if (!user.stripeCustomerId) {
    throw new NotFoundError("Billing customer");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getAppUrl()}/billing`,
  });

  return { portalUrl: session.url };
}

export async function getBillingStatus(
  userId: string,
  role: UserRole,
): Promise<BillingStatus> {
  const subscription = await prisma.billingSubscription.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const active = subscription
    ? isActiveSubscriptionStatus(subscription.status)
    : false;

  return {
    plan: active ? "pro" : "free",
    status: subscription?.status ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    stripeConfigured: Boolean(getStripeSecretKey()),
    priceConfigured: Boolean(getStripeProPriceId()),
    entitledProductKeys: PRODUCT_KEYS.filter((product) => {
      if (isLocalProductUnlockEnabled() && role && role !== "guest") {
        return true;
      }
      return evaluateEntitlement(role, product, active).allowed;
    }),
  };
}

export async function applyCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") return;
  if (session.metadata?.kind && session.metadata.kind !== CHECKOUT_KIND_SUBSCRIPTION) {
    return;
  }

  const userId = session.metadata?.userId || session.client_reference_id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !subscriptionId) {
    log.warn("Subscription checkout completed without user or subscription id.");
    return;
  }

  if (typeof session.customer === "string") {
    await prisma.user.updateMany({
      where: { id: userId, stripeCustomerId: null },
      data: { stripeCustomerId: session.customer },
    });
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscriptionFromStripe(subscription, userId);
}

export async function applySubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer && "deleted" in subscription.customer && subscription.customer.deleted
        ? null
        : subscription.customer?.id;

  const userId =
    subscription.metadata?.userId ??
    (customerId
      ? (
          await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          })
        )?.id
      : undefined);

  if (!userId) {
    log.warn("Subscription event had no matching Aila user.");
    return;
  }

  if (subscription.status === "canceled") {
    await markSubscriptionDeleted(subscription.id);
    return;
  }

  await upsertSubscriptionFromStripe(subscription, userId);
}
