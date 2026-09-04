import { createHash } from "node:crypto";

import {
  applyPaystackSubscriptionEvent,
  applyVerifiedPaystackTransaction,
  markPaystackSubscriptionStatus,
} from "@/core/billing/service";
import { claimPaystackEvent } from "@/core/billing/webhooks";
import {
  type PaystackSubscriptionData,
  type PaystackTransactionData,
  verifyPaystackSignature,
} from "@/core/billing/paystack";
import { AuthenticationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import { failure, ok } from "@/server/http/responses";

const log = createLogger("webhooks.paystack");

type PaystackWebhookPayload = {
  event?: string;
  data?: Record<string, unknown>;
};

function eventId(event: string, data: Record<string, unknown>): string {
  const reference =
    (typeof data.reference === "string" && data.reference) ||
    (typeof data.subscription_code === "string" && data.subscription_code) ||
    (typeof data.id === "number" && String(data.id)) ||
    (typeof data.id === "string" && data.id) ||
    "unknown";
  return createHash("sha256").update(`${event}:${reference}`).digest("hex");
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackSignature(rawBody, signature)) {
      throw new AuthenticationError({ message: "Invalid Paystack webhook signature." });
    }

    const payload = JSON.parse(rawBody) as PaystackWebhookPayload;
    const event = payload.event;
    const data = payload.data ?? {};

    if (!event) {
      return ok({ received: true, ignored: true });
    }

    const id = eventId(event, data);
    // Claim first so concurrent deliveries cannot double-apply.
    if (!(await claimPaystackEvent(id, event))) {
      return ok({ received: true, duplicate: true });
    }

    switch (event) {
      case "charge.success": {
        const transaction = data as unknown as PaystackTransactionData;
        // Do not pass metadata.userId as "expected" — that would skip mismatch checks.
        // applyVerifiedPaystackTransaction binds from metadata + validated amount/plan.
        await applyVerifiedPaystackTransaction(transaction);
        break;
      }
      case "subscription.create":
      case "subscription.disable":
      case "subscription.not_renew": {
        const subscription = data as unknown as PaystackSubscriptionData;
        if (event === "subscription.not_renew") {
          subscription.status = subscription.status || "non-renewing";
        }
        if (event === "subscription.disable") {
          subscription.status = subscription.status || "cancelled";
        }
        await applyPaystackSubscriptionEvent(subscription);
        break;
      }
      case "invoice.create":
      case "invoice.update":
      case "invoice.payment_failed": {
        const subscription = data.subscription as
          | PaystackSubscriptionData
          | undefined;
        if (subscription?.subscription_code) {
          const status =
            event === "invoice.payment_failed"
              ? subscription.status || "attention"
              : subscription.status || "active";
          await markPaystackSubscriptionStatus(
            subscription.subscription_code,
            status,
            subscription.next_payment_date,
          );
        }
        break;
      }
      default:
        log.info("Ignored Paystack event.", { event });
    }

    return ok({ received: true });
  } catch (error) {
    return failure(error);
  }
}
