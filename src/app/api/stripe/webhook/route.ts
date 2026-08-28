import Stripe from "stripe";

import { getStripeSecretKey } from "@/core/config";
import {
  applyCheckoutSessionCompleted,
  applySubscriptionEvent,
  CHECKOUT_KIND_COMMERCE,
  CHECKOUT_KIND_SUBSCRIPTION,
} from "@/core/billing/service";
import {
  markCommerceOrderPaidFromStripe,
  requireStripeWebhookSecret,
} from "@/core/commerce/service";
import { AuthenticationError, ConfigurationError, NotFoundError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logger/logger";
import { failure, ok } from "@/server/http/responses";

const log = createLogger("webhooks.stripe");

export async function POST(req: Request) {
  try {
    const secretKey = getStripeSecretKey();

    if (!secretKey) {
      throw new ConfigurationError({ message: "STRIPE_SECRET_KEY is not configured." });
    }

    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new AuthenticationError({ message: "Missing Stripe signature." });
    }

    const stripe = new Stripe(secretKey);
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      requireStripeWebhookSecret(),
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const kind = session.metadata?.kind;

        if (kind === CHECKOUT_KIND_SUBSCRIPTION || session.mode === "subscription") {
          await applyCheckoutSessionCompleted(session);
        }

        if (kind === CHECKOUT_KIND_COMMERCE || session.mode === "payment") {
          try {
            await markCommerceOrderPaidFromStripe(session.id);
          } catch (error) {
            if (!(error instanceof NotFoundError)) throw error;
            log.warn("Payment checkout had no matching commerce order.");
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscriptionEvent(event.data.object);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscriptionEvent(subscription);
        }
        break;
      }
      default:
        log.info("Ignored Stripe event.", { type: event.type });
    }

    return ok({ received: true });
  } catch (error) {
    return failure(error);
  }
}
