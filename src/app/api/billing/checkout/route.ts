import { requireWorkspaceUser } from "@/core/workspace/http";
import {
  createProCheckoutSession,
  isStripeBillingConfigured,
} from "@/core/billing/service";
import { parseProductQuery } from "@/lib/auth/require-product-access";
import { ConfigurationError, ValidationError } from "@/lib/errors/app-error";
import { created, failure } from "@/server/http/responses";

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();

    if (!isStripeBillingConfigured()) {
      throw new ConfigurationError({
        message: "Stripe billing is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_PRO.",
      });
    }

    let product: string | null = null;

    try {
      const body = (await req.json()) as { product?: unknown };
      product = typeof body.product === "string" ? body.product : null;
    } catch {
      product = null;
    }

    const requested = parseProductQuery(product);
    const session = await createProCheckoutSession(user, requested);
    return created({ checkoutUrl: session.checkoutUrl });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure(new ValidationError({}, { message: "Request body must be valid JSON." }));
    }
    return failure(error);
  }
}
