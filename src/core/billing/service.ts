import { clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "node:crypto";

import { getAppUrl } from "@/core/config";
import { prisma } from "@/core/database/prisma";
import { PRODUCT_KEYS, PRODUCTS, isProductKey } from "@/core/products/catalog";
import {
  ConflictError,
  ConfigurationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import type { UserRole } from "@/types/auth";

import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  evaluateEntitlement,
  isActiveSubscriptionStatus,
  isLocalProductUnlockEnabled,
} from "./entitlements";
import {
  generatePaystackManageLink,
  initializePaystackSubscription,
  parsePaystackMetadata,
  resolveIntervalFromPlan,
  type PaystackSubscriptionData,
  type PaystackTransactionData,
  verifyPaystackTransaction,
} from "./paystack";
import {
  billingPlanById,
  isPaystackBillingConfigured,
  paystackCheckoutPlan,
  getPaystackPlanCode,
  PAYSTACK_BILLING_PLAN,
  resolveBillingPlanId,
  type PaystackPlanInterval,
} from "./plans";
import { trialDaysRemaining } from "./trial";
import type { BillingStatus } from "./types";

export type { BillingStatus } from "./types";
export { isPaystackBillingConfigured };

const log = createLogger("billing");

export const BILLING_PLAN = PAYSTACK_BILLING_PLAN;
export const CHECKOUT_KIND_SUBSCRIPTION = "subscription";

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

function customerCodeFromSubscription(
  subscription: PaystackSubscriptionData,
): string | null {
  if (!subscription.customer) return null;
  if (typeof subscription.customer === "number") return null;
  return subscription.customer.customer_code ?? null;
}

function planCodeFromSubscription(
  subscription: PaystackSubscriptionData,
): string | null {
  if (!subscription.plan) return null;
  if (typeof subscription.plan === "number") return null;
  return subscription.plan.plan_code ?? null;
}

function planIntervalFromSubscription(
  subscription: PaystackSubscriptionData,
): string | null {
  if (!subscription.plan || typeof subscription.plan === "number") return null;
  return subscription.plan.interval ?? null;
}

export async function upsertSubscriptionFromPaystack(input: {
  userId: string;
  subscriptionCode: string;
  status: string;
  customerCode?: string | null;
  planCode?: string | null;
  interval?: PaystackPlanInterval | string | null;
  emailToken?: string | null;
  nextPaymentDate?: string | null;
}) {
  const cancelAtPeriodEnd = input.status === "non-renewing";

  const entitled = isActiveSubscriptionStatus(input.status);

  const record = await prisma.billingSubscription.upsert({
    where: { paystackSubscriptionCode: input.subscriptionCode },
    create: {
      userId: input.userId,
      provider: "paystack",
      paystackSubscriptionCode: input.subscriptionCode,
      paystackCustomerCode: input.customerCode ?? null,
      paystackPlanCode: input.planCode ?? null,
      paystackEmailToken: input.emailToken ?? null,
      interval: input.interval ?? null,
      plan: BILLING_PLAN,
      status: input.status,
      currentPeriodEnd: parseDate(input.nextPaymentDate),
      cancelAtPeriodEnd,
    },
    update: {
      userId: input.userId,
      provider: "paystack",
      paystackCustomerCode: input.customerCode ?? undefined,
      paystackPlanCode: input.planCode ?? undefined,
      paystackEmailToken: input.emailToken ?? undefined,
      interval: input.interval ?? undefined,
      status: input.status,
      currentPeriodEnd: parseDate(input.nextPaymentDate),
      cancelAtPeriodEnd,
    },
  });

  if (input.customerCode) {
    await prisma.user.updateMany({
      where: { id: input.userId },
      data: { paystackCustomerCode: input.customerCode },
    });
  }

  await syncClerkRole(input.userId, entitled ? "pro" : "user");
  return record;
}

export async function markPaystackSubscriptionStatus(
  subscriptionCode: string,
  status: string,
  nextPaymentDate?: string | null,
) {
  const existing = await prisma.billingSubscription.findUnique({
    where: { paystackSubscriptionCode: subscriptionCode },
  });
  if (!existing) return null;

  const record = await prisma.billingSubscription.update({
    where: { paystackSubscriptionCode: subscriptionCode },
    data: {
      status,
      cancelAtPeriodEnd: status === "non-renewing",
      currentPeriodEnd: parseDate(nextPaymentDate) ?? existing.currentPeriodEnd,
    },
  });

  await syncClerkRole(
    existing.userId,
    isActiveSubscriptionStatus(status) ? "pro" : "user",
  );
  return record;
}

export async function createProCheckoutSession(
  user: {
    id: string;
    email: string;
    name: string | null;
    paystackCustomerCode?: string | null;
  },
  options?: {
    product?: string | null;
    interval?: PaystackPlanInterval | string | null;
  },
) {
  if (!isPaystackBillingConfigured()) {
    throw new ConfigurationError({
      message:
        "Paystack billing is not configured. Set PAYSTACK_SECRET_KEY, PAYSTACK_PLAN_CODE_MONTHLY, and PAYSTACK_PLAN_CODE_YEARLY.",
    });
  }

  const intervalRaw = options?.interval ?? "monthly";
  if (intervalRaw !== "monthly" && intervalRaw !== "annually") {
    throw new ValidationError(
      { interval: "Must be monthly or annually." },
      { message: "Choose Aila Pro Monthly or Aila Pro Yearly." },
    );
  }
  const interval = intervalRaw as PaystackPlanInterval;
  const checkoutPlan = paystackCheckoutPlan(interval);
  const planCode = getPaystackPlanCode(interval);
  if (!planCode) {
    throw new ConfigurationError({
      message: `${checkoutPlan.envKey} is not configured.`,
    });
  }

  const active = await prisma.billingSubscription.findFirst({
    where: {
      userId: user.id,
      status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
    },
    select: { id: true },
  });

  if (active) {
    throw new ConflictError({
      message:
        "This account already has an active subscription. Use Manage subscription to update or cancel it.",
    });
  }

  const requestedProduct =
    options?.product && isProductKey(options.product)
      ? PRODUCTS[options.product]
      : null;
  const successPath = requestedProduct
    ? `${requestedProduct.href}?billing=success`
    : "/billing?checkout=success";

  const reference = `aila_${user.id.slice(0, 8)}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const initialized = await initializePaystackSubscription({
    email: user.email,
    planCode,
    amountKobo: checkoutPlan.amountKobo,
    reference,
    callbackUrl: `${getAppUrl()}/api/billing/paystack/callback`,
    metadata: {
      kind: CHECKOUT_KIND_SUBSCRIPTION,
      userId: user.id,
      interval,
      planCode,
      product: requestedProduct?.key ?? "",
      successPath,
    },
  });

  return {
    checkoutUrl: initialized.authorization_url,
    reference: initialized.reference,
    interval,
  };
}

export async function createBillingPortalSession(user: { id: string }) {
  const subscription = await prisma.billingSubscription.findFirst({
    where: {
      userId: user.id,
      provider: "paystack",
      paystackSubscriptionCode: { not: null },
      status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES, "non-renewing", "attention"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!subscription?.paystackSubscriptionCode) {
    throw new NotFoundError("Billing subscription");
  }

  const link = await generatePaystackManageLink(subscription.paystackSubscriptionCode);
  return { portalUrl: link };
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
  const plan = resolveBillingPlanId(role, active);
  const trialEndsAt = subscription?.trialEndsAt ?? null;
  const trialing = subscription?.status === "trialing";
  const displayTrialEnd =
    trialEndsAt ?? (trialing ? subscription?.currentPeriodEnd ?? null : null);
  const configured = isPaystackBillingConfigured();

  return {
    plan,
    planLabel: billingPlanById(plan).name,
    status: subscription?.status ?? null,
    provider: subscription?.provider ?? null,
    interval: subscription?.interval ?? null,
    trialing,
    trialEndsAt: displayTrialEnd?.toISOString() ?? null,
    trialDaysRemaining:
      trialing || (displayTrialEnd && displayTrialEnd.getTime() > Date.now())
        ? trialDaysRemaining(displayTrialEnd)
        : null,
    trialEligible: false,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    priceConfigured: configured,
    paystackConfigured: configured,
    entitledProductKeys: PRODUCT_KEYS.filter((product) => {
      if (isLocalProductUnlockEnabled() && role && role !== "guest") {
        return true;
      }
      return evaluateEntitlement(role, product, active).allowed;
    }),
  };
}

export async function applyVerifiedPaystackTransaction(
  transaction: PaystackTransactionData,
  expectedUserId?: string,
) {
  if (transaction.status !== "success") {
    throw new ValidationError(
      { reference: "Payment was not successful." },
      { message: "Paystack payment was not successful." },
    );
  }

  const metadata = parsePaystackMetadata(transaction.metadata);
  const userId = expectedUserId ?? metadata.userId;
  if (!userId) {
    throw new ValidationError(
      { userId: "Missing Aila user on payment metadata." },
      { message: "Unable to associate this payment with an Aila account." },
    );
  }

  if (expectedUserId && metadata.userId && metadata.userId !== expectedUserId) {
    throw new ValidationError(
      { userId: "Payment user does not match the signed-in account." },
      { message: "This payment belongs to a different Aila account." },
    );
  }

  const customerCode = transaction.customer?.customer_code ?? null;
  if (customerCode) {
    await prisma.user.updateMany({
      where: { id: userId },
      data: { paystackCustomerCode: customerCode },
    });
  }

  const planFromTx =
    typeof transaction.plan === "string"
      ? transaction.plan
      : transaction.plan?.plan_code ?? metadata.planCode ?? null;
  const interval =
    resolveIntervalFromPlan(
      planFromTx,
      typeof transaction.plan === "object" ? transaction.plan?.interval : null,
    ) ??
    (metadata.interval === "annually" || metadata.interval === "monthly"
      ? metadata.interval
      : null);

  const subscriptionCode = transaction.subscription?.subscription_code;
  if (subscriptionCode) {
    await upsertSubscriptionFromPaystack({
      userId,
      subscriptionCode,
      status: transaction.subscription?.status ?? "active",
      customerCode,
      planCode: planFromTx,
      interval,
      emailToken: transaction.subscription?.email_token ?? null,
      nextPaymentDate: transaction.subscription?.next_payment_date ?? null,
    });
    return { userId, subscriptionCode };
  }

  // charge.success for a plan payment may arrive before subscription.create.
  // Record an active provisional row keyed by reference until subscription code arrives.
  const provisionalCode = `pending_${transaction.reference}`;
  await upsertSubscriptionFromPaystack({
    userId,
    subscriptionCode: provisionalCode,
    status: "active",
    customerCode,
    planCode: planFromTx,
    interval,
    nextPaymentDate: null,
  });

  return { userId, subscriptionCode: provisionalCode };
}

export async function verifyAndApplyPaystackReference(
  reference: string,
  expectedUserId?: string,
) {
  const transaction = await verifyPaystackTransaction(reference);
  return applyVerifiedPaystackTransaction(transaction, expectedUserId);
}

export async function applyPaystackSubscriptionEvent(
  subscription: PaystackSubscriptionData,
  fallbackUserId?: string,
) {
  const customerCode = customerCodeFromSubscription(subscription);
  const planCode = planCodeFromSubscription(subscription);
  const interval = resolveIntervalFromPlan(
    planCode,
    planIntervalFromSubscription(subscription),
  );

  let userId = fallbackUserId;
  if (!userId && customerCode) {
    userId =
      (
        await prisma.user.findFirst({
          where: { paystackCustomerCode: customerCode },
          select: { id: true },
        })
      )?.id ?? undefined;
  }

  if (!userId) {
    const pending = await prisma.billingSubscription.findFirst({
      where: {
        provider: "paystack",
        paystackCustomerCode: customerCode ?? undefined,
        paystackSubscriptionCode: { startsWith: "pending_" },
      },
      orderBy: { updatedAt: "desc" },
    });
    userId = pending?.userId;
    if (pending?.paystackSubscriptionCode?.startsWith("pending_")) {
      await prisma.billingSubscription.delete({ where: { id: pending.id } });
    }
  }

  if (!userId) {
    log.warn("Paystack subscription event had no matching Aila user.");
    return null;
  }

  return upsertSubscriptionFromPaystack({
    userId,
    subscriptionCode: subscription.subscription_code,
    status: subscription.status,
    customerCode,
    planCode,
    interval,
    emailToken: subscription.email_token ?? null,
    nextPaymentDate: subscription.next_payment_date ?? null,
  });
}
