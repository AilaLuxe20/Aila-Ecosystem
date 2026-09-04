import { ERROR_CODES, type ErrorCode } from "../../../lib/errors/app-error";

import {
  isAbortError,
  type AilaChatStreamEvent,
} from "./parse";
import { decideStreamPersistence } from "./persist";

export type ProviderChatStreamEvent =
  | { type: "delta"; content: string }
  | { type: "done" }
  | { type: "error"; error: string };

function mapEngineError(message: string): {
  code: ErrorCode;
  message: string;
} {
  if (message.includes("not configured")) {
    return {
      code: ERROR_CODES.CONFIGURATION_ERROR,
      message: "Aila Intelligence is not configured.",
    };
  }

  if (
    message.includes("Please send Aila a message") ||
    message.includes("latest message")
  ) {
    return {
      code: ERROR_CODES.VALIDATION_FAILED,
      message,
    };
  }

  return {
    code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    message: "Aila Intelligence could not respond right now.",
  };
}

/**
 * Forwards provider tokens to the browser and persists the assistant reply
 * once after the provider stream completes successfully.
 */
export async function runStreamingChatSession(params: {
  signal: AbortSignal;
  emit: (event: AilaChatStreamEvent) => void;
  generate: AsyncIterable<ProviderChatStreamEvent>;
  persist: (reply: string) => Promise<{
    conversationId: string;
    sessionId: string;
  }>;
}): Promise<void> {
  let accumulated = "";
  let streamCompleted = false;
  let providerError = false;

  try {
    for await (const event of params.generate) {
      if (params.signal.aborted) {
        break;
      }

      if (event.type === "delta") {
        accumulated += event.content;
        params.emit({ type: "delta", content: event.content });
        continue;
      }

      if (event.type === "done") {
        streamCompleted = true;
        continue;
      }

      providerError = true;
      params.emit({
        type: "error",
        error: mapEngineError(event.error),
      });
    }

    const decision = decideStreamPersistence({
      aborted: params.signal.aborted,
      providerError,
      streamCompleted,
      accumulated,
    });

    if (!decision.persist) {
      if (
        decision.reason === "aborted" ||
        decision.reason === "provider_error"
      ) {
        return;
      }

      params.emit({
        type: "error",
        error: {
          code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          message: "Aila Intelligence could not respond right now.",
        },
      });
      return;
    }

    /*
     * Persist is the commit. Do not skip it because the client aborted after
     * the provider finished — that is the persist/notify race. Do not retry
     * persist on failure (duplicate user/assistant rows).
     */
    const saved = await params.persist(decision.reply);

    params.emit({
      type: "done",
      conversationId: saved.conversationId,
      sessionId: saved.sessionId,
      reply: decision.reply,
    });
  } catch (error) {
    if (isAbortError(error) || params.signal.aborted) {
      return;
    }

    throw error;
  }
}
