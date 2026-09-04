import { requireWorkspaceUser } from "@/core/workspace/http";
import {
  createProCheckoutSession,
  isPaystackBillingConfigured,
} from "@/core/billing/service";
import { parseProductQuery } from "@/lib/auth/require-product-access";
import { ConfigurationError, ValidationError } from "@/lib/errors/app-error";
import { created, failure } from "@/server/http/responses";

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();

    if (!isPaystackBillingConfigured()) {
      throw new ConfigurationError({
        message:
          "Paystack billing is not configured. Set PAYSTACK_SECRET_KEY and monthly/yearly plan codes (PAYSTACK_PLAN_CODE_MONTHLY or PAYSTACK_MONTHLY_PLAN_CODE, and PAYSTACK_PLAN_CODE_YEARLY or PAYSTACK_YEARLY_PLAN_CODE).",
      });
    }

    let product: string | null = null;
    let interval: string | null = "monthly";

    try {
      const body = (await req.json()) as { product?: unknown; interval?: unknown };
      product = typeof body.product === "string" ? body.product : null;
      interval = typeof body.interval === "string" ? body.interval : "monthly";
    } catch {
      product = null;
      interval = "monthly";
    }

    const requested = parseProductQuery(product);
    const session = await createProCheckoutSession(user, {
      product: requested,
      interval,
    });
    return created({
      checkoutUrl: session.checkoutUrl,
      reference: session.reference,
      interval: session.interval,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure(new ValidationError({}, { message: "Request body must be valid JSON." }));
    }
    return failure(error);
  }
}
