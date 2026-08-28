import Stripe from "stripe";

import { getStripeSecretKey } from "@/core/config";
import {
  markCommerceOrderPaidFromStripe,
  requireStripeWebhookSecret,
} from "@/core/commerce/service";
import { AuthenticationError, ConfigurationError } from "@/lib/errors/app-error";
import { failure, ok } from "@/server/http/responses";

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await markCommerceOrderPaidFromStripe(session.id);
    }

    return ok({ received: true });
  } catch (error) {
    return failure(error);
  }
}
