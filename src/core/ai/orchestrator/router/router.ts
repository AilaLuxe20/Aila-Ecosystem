import type { AIRequest } from "@/core/ai/types";
import { detectIntent } from "../intent/detect";
import { createPlan } from "../planner/planner";
import { resolveTools } from "../tools/registry";

export interface RoutingResult {
  intent: ReturnType<typeof detectIntent>;
  plan: ReturnType<typeof createPlan>;
  tools: ReturnType<typeof resolveTools>;
  request: AIRequest;
}

export function routeRequest(
  request: AIRequest
): RoutingResult {
  const latestMessage =
    request.messages[request.messages.length - 1]?.content ?? "";

  const intent = detectIntent(latestMessage);

  const plan = createPlan(intent);

  const tools = resolveTools(plan);

  return {
    intent,
    plan,
    tools,
    request,
  };
}
