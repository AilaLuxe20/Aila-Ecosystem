import { requireWorkspaceUser } from "@/core/workspace/http";
import { createBillingPortalSession } from "@/core/billing/service";
import { failure, ok } from "@/server/http/responses";

export async function POST() {
  try {
    const user = await requireWorkspaceUser();
    const session = await createBillingPortalSession(user);
    return ok({ portalUrl: session.portalUrl });
  } catch (error) {
    return failure(error);
  }
}
