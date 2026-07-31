import type { AIRequest, AIResponse } from "@/core/ai/types";

import { chat } from "@/core/ai/engine";
import { routeRequest } from "./router/router";
import { buildResponse, buildErrorResponse } from "./response/builder";
import {
  getSession,
  saveSession,
} from "@/core/ai/sessions";

const DEFAULT_SESSION = "default";

export async function orchestrate(
  request: AIRequest
): Promise<AIResponse> {
  try {
    const sessionId = request.sessionId ?? DEFAULT_SESSION;

    const history = getSession(sessionId);

    const mergedRequest: AIRequest = {
      ...request,
      messages: [...history, ...request.messages],
    };

    const routing = routeRequest(mergedRequest);

    const result = await chat(mergedRequest);

    if (!result.success) {
      return buildErrorResponse(
        result.error ?? "Aila Intelligence could not respond."
      );
    }

    saveSession(sessionId, mergedRequest.messages);

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



