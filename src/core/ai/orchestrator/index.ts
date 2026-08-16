import type { AIRequest, AIResponse } from "@/core/ai/types";

import { chat } from "@/core/ai/engine";
import { routeRequest } from "./router/router";
import { buildResponse, buildErrorResponse } from "./response/builder";

export async function orchestrate(
  request: AIRequest
): Promise<AIResponse> {
  try {
    const routing = routeRequest(request);

    const result = await chat(request);

    if (!result.success) {
      return buildErrorResponse(
        result.error ?? "Aila Intelligence could not respond."
      );
    }

    return buildResponse({
      routing,
      reply: result.reply,
    });
  } catch (error) {
    console.error("Aila Orchestrator Error:", error);

    return buildErrorResponse(
      "Aila Orchestrator encountered an unexpected error."
    );
  }
}
