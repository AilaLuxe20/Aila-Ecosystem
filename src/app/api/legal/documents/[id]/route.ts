import {
  createProductRateLimiters,
  parseJsonBody,
  requireWorkspaceUser,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { deleteLegalDocument, getLegalDocument } from "@/core/legal/service";
import { noContent, ok } from "@/server/http/responses";
import { z } from "zod";

const limits = createProductRateLimiters("legal");
const idSchema = z.string().trim().min(1).max(64);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("ailalegal");
    const rateLimit = await limits.enforceRead(user.id);
    const { id } = await context.params;
    const document = await getLegalDocument(user.id, parseJsonBody(id, idSchema));
    return withRateLimitHeaders(ok({ document }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await requireWorkspaceUser("ailalegal");
    const rateLimit = await limits.enforceWrite(user.id);
    const { id } = await context.params;
    await deleteLegalDocument(user.id, parseJsonBody(id, idSchema));
    return withRateLimitHeaders(noContent(), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
