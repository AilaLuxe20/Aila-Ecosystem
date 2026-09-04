import type { AIRequest, AIResponse } from "@/core/ai/types";

import {
  chat,
  chatStream,
  chatTurn,
  getSystemPromptForRequest,
} from "@/core/ai/engine";
import { routeRequest } from "./router/router";
import { buildResponse, buildErrorResponse } from "./response/builder";
import { toolsEnabledForMode } from "./tools/contract";
import { runIntelligenceToolLoop } from "./tools/loop";

async function completeIntelligenceTurn(
  request: AIRequest,
  providerMessages: Parameters<typeof chatTurn>[1]["providerMessages"],
  tools: Parameters<typeof chatTurn>[1]["tools"],
  signal?: AbortSignal
) {
  return chatTurn(request, {
    providerMessages,
    tools,
    signal,
  });
}

export async function orchestrate(
  request: AIRequest
): Promise<AIResponse> {
  try {
    const routing = routeRequest(request);

    if (toolsEnabledForMode(request.mode)) {
      const systemPrompt = getSystemPromptForRequest(request);

      if (!systemPrompt) {
        return buildErrorResponse("Aila Intelligence could not respond.");
      }

      const loop = await runIntelligenceToolLoop({
        request,
        systemPrompt,
        history: request.messages,
        completeTurn: ({ request: current, providerMessages, tools, signal }) =>
          completeIntelligenceTurn(current, providerMessages, tools, signal),
      });

      if (loop.status === "error") {
        return buildErrorResponse(
          loop.error === "aborted"
            ? "Aila Intelligence could not respond right now."
            : loop.error
        );
      }

      if (loop.status === "reply") {
        return buildResponse({
          routing,
          reply: loop.reply,
        });
      }

      const finalTurn = await chatTurn(request, {
        providerMessages: loop.providerMessages,
      });

      if (!finalTurn.success || !finalTurn.reply.trim()) {
        return buildErrorResponse(
          finalTurn.error ?? "Aila Intelligence could not respond right now."
        );
      }

      return buildResponse({
        routing,
        reply: finalTurn.reply.trim(),
      });
    }

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

export async function* orchestrateStream(
  request: AIRequest,
  options?: { signal?: AbortSignal }
) {
  try {
    routeRequest(request);

    if (!toolsEnabledForMode(request.mode)) {
      yield* chatStream(request, options);
      return;
    }

    const systemPrompt = getSystemPromptForRequest(request);

    if (!systemPrompt) {
      yield {
        type: "error" as const,
        error: "Aila Intelligence could not respond.",
      };
      return;
    }

    const loop = await runIntelligenceToolLoop({
      request,
      systemPrompt,
      history: request.messages,
      signal: options?.signal,
      completeTurn: ({ request: current, providerMessages, tools, signal }) =>
        completeIntelligenceTurn(current, providerMessages, tools, signal),
    });

    if (loop.status === "error") {
      if (loop.error === "aborted" || options?.signal?.aborted) {
        return;
      }
      yield {
        type: "error" as const,
        error: loop.error,
      };
      return;
    }

    if (loop.status === "reply") {
      yield { type: "delta" as const, content: loop.reply };
      yield { type: "done" as const };
      return;
    }

    yield* chatStream(request, {
      signal: options?.signal,
      providerMessages: loop.providerMessages,
    });
  } catch (error) {
    console.error("Aila Orchestrator Stream Error:", error);
    yield {
      type: "error" as const,
      error: "Aila Intelligence could not respond right now.",
    };
  }
}
