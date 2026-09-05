import { AI_REQUEST_TIMEOUT_MS, SITE_NAME, SITE_URL } from "@/core/constants";
import { getOpenRouterApiKey } from "@/core/config";

export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

export function buildOpenRouterHeaders(
  apiKey: string,
  stream = false,
): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": SITE_URL,
    "X-Title": SITE_NAME,
    ...(stream ? { Accept: "text/event-stream" } : {}),
  };
}

export type OpenRouterFailure = {
  status: number;
  code?: string;
  message?: string;
};

export async function readOpenRouterFailure(
  response: Response,
): Promise<OpenRouterFailure> {
  let code: string | undefined;
  let message: string | undefined;

  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "error" in data) {
      const error = (data as { error?: unknown }).error;
      if (error && typeof error === "object") {
        const record = error as { code?: unknown; message?: unknown };
        if (typeof record.code === "string" || typeof record.code === "number") {
          code = String(record.code);
        }
        if (typeof record.message === "string") {
          message = record.message.slice(0, 240);
        }
      }
    }
  } catch {
    // Provider body is diagnostic-only.
  }

  return { status: response.status, code, message };
}

export function openRouterUserMessage(
  failure: OpenRouterFailure,
  kind: "chat" | "document",
): string {
  if (failure.status === 401 || failure.status === 403) {
    return kind === "document"
      ? "Document analysis is not available right now. The AI provider rejected the request."
      : "The AI provider rejected this request. Chat cannot run until the service is configured.";
  }

  if (failure.status === 402) {
    return "The selected OpenRouter model needs credits, or the free quota is exhausted. Use a free model such as openrouter/free or a :free model id, or add credits for a paid model.";
  }

  if (
    failure.status === 404 ||
    (typeof failure.message === "string" &&
      /ZDR|data policy|guardrail/i.test(failure.message))
  ) {
    return kind === "document"
      ? "OpenRouter has no document-analysis endpoint that matches this account’s privacy settings. Set OPENROUTER_MODEL to a :free model your key can use, or relax ZDR-only routing in OpenRouter privacy settings."
      : "OpenRouter has no chat endpoint that matches this account’s privacy settings. Set OPENROUTER_MODEL to a :free model your key can use (for example z-ai/glm-5.2:free), or allow the free router in OpenRouter privacy settings.";
  }

  if (failure.status === 429) {
    return "The AI provider is rate-limiting requests. Try again shortly.";
  }

  return kind === "document"
    ? "Aila could not analyze the document right now."
    : "Aila Intelligence could not respond right now.";
}

export function resolveOpenRouterSignal(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

export function isOpenRouterModelRetryable(
  status: number,
  message?: string,
): boolean {
  if (
    status === 402 ||
    status === 404 ||
    status === 408 ||
    status === 409 ||
    status === 429 ||
    status >= 500
  ) {
    return true;
  }

  return (
    status === 400 &&
    typeof message === "string" &&
    /model|endpoint|ZDR|data policy|not found|unsupported/i.test(message)
  );
}

function payloadRecord(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return { ...(body as Record<string, unknown>) };
  }
  return {};
}

function modelQueueFromPayload(payload: Record<string, unknown>): string[] {
  const listed = Array.isArray(payload.models)
    ? payload.models.filter((id): id is string => typeof id === "string")
    : [];
  const primary = typeof payload.model === "string" ? payload.model : "";
  return [...new Set([primary, ...listed].filter(Boolean))];
}

/**
 * Tries each model id in order. OpenRouter's `models[]` field is not reliable
 * for this account, so failures must not leave the client waiting forever.
 */
export async function fetchOpenRouterChatCompletion(options: {
  apiKey: string;
  stream?: boolean;
  signal?: AbortSignal;
  payload: Record<string, unknown>;
}): Promise<Response> {
  const rest = { ...options.payload };
  delete rest.model;
  delete rest.models;
  const queue = modelQueueFromPayload(options.payload);

  if (queue.length === 0) {
    throw new Error("No OpenRouter model configured.");
  }

  let lastResponse: Response | undefined;

  for (let index = 0; index < queue.length; index += 1) {
    const response = await fetch(OPENROUTER_CHAT_URL, {
      method: "POST",
      headers: buildOpenRouterHeaders(options.apiKey, options.stream),
      signal: resolveOpenRouterSignal(options.signal),
      body: JSON.stringify({ ...rest, model: queue[index] }),
    });
    lastResponse = response;

    if (response.ok) {
      return response;
    }

    const failure = await readOpenRouterFailure(response.clone());
    const isLast = index === queue.length - 1;
    if (isLast || !isOpenRouterModelRetryable(failure.status, failure.message)) {
      return response;
    }
  }

  return lastResponse!;
}

export async function openRouterChat(body: unknown, signal?: AbortSignal) {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new Error("The AI provider is not configured.");
  }

  const response = await fetchOpenRouterChatCompletion({
    apiKey,
    signal,
    payload: payloadRecord(body),
  });

  if (!response.ok) {
    const failure = await readOpenRouterFailure(response);
    throw new Error(openRouterUserMessage(failure, "chat"));
  }

  return response.json();
}
