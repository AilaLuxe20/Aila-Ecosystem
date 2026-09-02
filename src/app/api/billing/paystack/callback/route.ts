import { requireWorkspaceUser } from "@/core/workspace/http";
import { verifyAndApplyPaystackReference } from "@/core/billing/service";
import { ValidationError } from "@/lib/errors/app-error";
import { failure, ok } from "@/server/http/responses";
import { getAppUrl } from "@/core/config";

/**
 * Paystack redirects here after checkout. Access is granted only after
 * server-side verification — never because the browser reached this URL.
 */
export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const url = new URL(req.url);
    const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");

    if (!reference) {
      throw new ValidationError(
        { reference: "Missing payment reference." },
        { message: "Missing Paystack payment reference." },
      );
    }

    const result = await verifyAndApplyPaystackReference(reference, user.id);
    const destination = new URL("/billing?checkout=success", getAppUrl());
    destination.searchParams.set("reference", result.subscriptionCode);
    return Response.redirect(destination.toString(), 303);
  } catch (error) {
    if (error instanceof ValidationError) {
      const destination = new URL("/billing?checkout=failed", getAppUrl());
      return Response.redirect(destination.toString(), 303);
    }
    return failure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const body = (await req.json()) as { reference?: unknown };
    const reference = typeof body.reference === "string" ? body.reference : null;
    if (!reference) {
      throw new ValidationError(
        { reference: "Missing payment reference." },
        { message: "Missing Paystack payment reference." },
      );
    }

    const result = await verifyAndApplyPaystackReference(reference, user.id);
    return ok({
      verified: true,
      subscriptionCode: result.subscriptionCode,
    });
  } catch (error) {
    return failure(error);
  }
}
