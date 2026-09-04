import { createHmac, timingSafeEqual } from "node:crypto";

import { ConfigurationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";

import {
  getPaystackPlanCodeMonthly,
  getPaystackPlanCodeYearly,
  getPaystackSecretKey,
  type PaystackPlanInterval,
} from "./plans";

const log = createLogger("paystack.client");

const PAYSTACK_API = "https://api.paystack.co";

export type PaystackInitializeResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransactionData = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  customer?: {
    id?: number;
    email?: string;
    customer_code?: string;
  };
  plan?: string | { plan_code?: string; interval?: string; name?: string } | null;
  metadata?: Record<string, unknown> | string | null;
  subscription?: {
    subscription_code?: string;
    email_token?: string;
    status?: string;
    next_payment_date?: string | null;
  } | null;
};

export type PaystackSubscriptionData = {
  status: string;
  subscription_code: string;
  email_token?: string;
  next_payment_date?: string | null;
  customer?: {
    email?: string;
    customer_code?: string;
  } | number;
  plan?: {
    plan_code?: string;
    interval?: string;
    name?: string;
  } | number;
};

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    throw new ConfigurationError({
      message: "PAYSTACK_SECRET_KEY is not configured.",
    });
  }

  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as {
    status: boolean;
    message?: string;
    data?: T;
  };

  if (!response.ok || !payload.status || payload.data === undefined) {
    log.warn("Paystack API request failed.", {
      path,
      httpStatus: response.status,
      message: payload.message ?? "unknown",
    });
    throw new ConfigurationError({
      message: payload.message ?? "Paystack API request failed.",
      context: { path, httpStatus: response.status },
    });
  }

  return payload.data;
}

export async function initializePaystackSubscription(input: {
  email: string;
  planCode: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<PaystackInitializeResponse> {
  return paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      plan: input.planCode,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        custom_fields: [
          {
            display_name: "Aila User",
            variable_name: "aila_user_id",
            value: input.metadata.userId,
          },
        ],
      },
    }),
  });
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackTransactionData> {
  return paystackFetch<PaystackTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export async function fetchPaystackSubscription(
  code: string,
): Promise<PaystackSubscriptionData> {
  return paystackFetch<PaystackSubscriptionData>(
    `/subscription/${encodeURIComponent(code)}`,
  );
}

export async function disablePaystackSubscription(
  code: string,
  emailToken: string,
): Promise<void> {
  await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token: emailToken }),
  });
}

export async function generatePaystackManageLink(code: string): Promise<string> {
  const data = await paystackFetch<{ link: string }>(
    `/subscription/${encodeURIComponent(code)}/manage/link`,
  );
  return data.link;
}

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = getPaystackSecretKey();
  if (!secret || !signature) return false;

  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    const left = Buffer.from(hash, "utf8");
    const right = Buffer.from(signature, "utf8");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function resolveIntervalFromPlan(
  planCode: string | null | undefined,
  planInterval?: string | null,
): PaystackPlanInterval | null {
  if (planInterval === "annually" || planInterval === "yearly") return "annually";
  if (planInterval === "monthly") return "monthly";

  if (planCode && planCode === getPaystackPlanCodeYearly()) return "annually";
  if (planCode && planCode === getPaystackPlanCodeMonthly()) return "monthly";
  return null;
}

export function parsePaystackMetadata(
  metadata: PaystackTransactionData["metadata"],
): Record<string, string> {
  if (!metadata) return {};
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed)
          .filter(([, value]) => typeof value === "string")
          .map(([key, value]) => [key, value as string]),
      );
    } catch {
      return {};
    }
  }

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string]),
  );
}
