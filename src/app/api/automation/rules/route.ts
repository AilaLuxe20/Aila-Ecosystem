import {
  createProductRateLimiters,
  parseJsonBody,
  readJsonBody,
  requireWorkspaceUser,
  searchParamsObject,
  withRateLimitHeaders,
  workspaceFailure,
} from "@/core/workspace/http";
import { createAutomationRuleSchema, listAutomationQuerySchema } from "@/core/automation/schema";
import {
  createUserAutomationRule,
  listUserAutomationRules,
} from "@/core/automation/service";
import { created, ok } from "@/server/http/responses";

const limits = createProductRateLimiters("automation");

export async function GET(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceRead(user.id);
    const query = parseJsonBody(
      searchParamsObject(new URL(req.url).searchParams),
      listAutomationQuerySchema,
    );
    const rules = await listUserAutomationRules(user.id, query);
    return withRateLimitHeaders(ok({ rules }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireWorkspaceUser();
    const rateLimit = await limits.enforceWrite(user.id);
    const body = parseJsonBody(await readJsonBody(req), createAutomationRuleSchema);
    const rule = await createUserAutomationRule(user.id, body);
    return withRateLimitHeaders(created({ rule }), rateLimit);
  } catch (error) {
    return workspaceFailure(error);
  }
}
