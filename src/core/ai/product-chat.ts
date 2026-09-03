import { chat } from "@/core/ai/engine";
import type { AilaMode } from "@/core/types";
import { ConfigurationError, ExternalServiceError } from "@/lib/errors/app-error";

export async function runProductChat(
  mode: AilaMode,
  prompt: string,
  options?: { workspaceContext?: string; documentText?: string; documentName?: string },
): Promise<string> {
  const result = await chat({
    mode,
    messages: [{ role: "user", content: prompt }],
    workspaceContext: options?.workspaceContext,
    documentText: options?.documentText,
    documentName: options?.documentName,
  });

  if (!result.success) {
    if (result.error?.includes("not configured")) {
      throw new ConfigurationError({
        message: "OPENROUTER_API_KEY is not configured, so Aila cannot complete that request.",
      });
    }

    throw new ExternalServiceError("OpenRouter", {
      message: result.error ?? "Aila could not complete that request.",
    });
  }

  return result.reply.trim();
}
