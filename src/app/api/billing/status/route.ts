import { requireWorkspaceUser } from "@/core/workspace/http";
import { getBillingStatus } from "@/core/billing/service";
import { getActorRole } from "@/lib/auth/require-product-access";
import { failure, ok } from "@/server/http/responses";

export async function GET() {
  try {
    const user = await requireWorkspaceUser();
    const role = (await getActorRole()) ?? "user";
    return ok({ billing: await getBillingStatus(user.id, role) });
  } catch (error) {
    return failure(error);
  }
}
