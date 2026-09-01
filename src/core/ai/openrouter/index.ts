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
    return "OpenRouter rejected the request because the account has no credits.";
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

export async function openRouterChat(body: unknown, signal?: AbortSignal) {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new Error("The AI provider is not configured.");
  }

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: buildOpenRouterHeaders(apiKey),
    signal: resolveOpenRouterSignal(signal),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const failure = await readOpenRouterFailure(response);
    throw new Error(openRouterUserMessage(failure, "chat"));
  }

  return response.json();
}
