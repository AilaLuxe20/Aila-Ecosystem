/**
 * Core configuration for the Aila Ecosystem.
 */

import {
  DEFAULT_OPENROUTER_AUDIO_MODEL,
  DEFAULT_OPENROUTER_CHAT_MODEL,
  DEFAULT_OPENROUTER_FALLBACK_MODELS,
  DEFAULT_OPENROUTER_VISION_MODEL,
  MODE_CONFIG,
} from "@/core/constants";
import type { AIModelConfig, AilaMode } from "@/core/types";
import { getOptionalSecret, publicEnv } from "@/lib/config/env";

export const OPENROUTER_MODEL_ID = /^[a-zA-Z0-9_.:/-]{1,200}$/;

export type OpenRouterRequestKind = "chat" | "vision" | "document";

export function uniqueOpenRouterModelIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => OPENROUTER_MODEL_ID.test(id)))];
}

export function buildOpenRouterModelQueue(options: {
  kind: OpenRouterRequestKind;
  chatModel: string;
  visionModel: string;
  fallbacks: string[];
}): string[] {
  const fallbacks = uniqueOpenRouterModelIds(options.fallbacks);
  if (options.kind === "vision") {
    return uniqueOpenRouterModelIds([options.visionModel, ...fallbacks]);
  }
  return uniqueOpenRouterModelIds([options.chatModel, ...fallbacks]);
}

function readOpenRouterModelId(
  key: "OPENROUTER_MODEL" | "OPENROUTER_VISION_MODEL" | "OPENROUTER_AUDIO_MODEL",
  fallback: string,
): string {
  const value = getOptionalSecret(key);
  if (value && OPENROUTER_MODEL_ID.test(value)) {
    return value;
  }
  return fallback;
}

/** Chat/completions model. Default is GLM 5.2 `:free`. */
export function getOpenRouterChatModel(): string {
  return readOpenRouterModelId("OPENROUTER_MODEL", DEFAULT_OPENROUTER_CHAT_MODEL);
}

/** Image/video/Omni-audio understanding. Default is Nemotron Omni `:free`. */
export function getOpenRouterVisionModel(): string {
  return readOpenRouterModelId(
    "OPENROUTER_VISION_MODEL",
    DEFAULT_OPENROUTER_VISION_MODEL,
  );
}

/** Audio transcriptions model. Often paid; override or expect an honest failure. */
export function getOpenRouterAudioModel(): string {
  return readOpenRouterModelId(
    "OPENROUTER_AUDIO_MODEL",
    DEFAULT_OPENROUTER_AUDIO_MODEL,
  );
}

/** Extra OpenRouter model ids tried if the primary model is unavailable. */
export function getOpenRouterModelFallbacks(): string[] {
  const raw = getOptionalSecret("OPENROUTER_MODEL_FALLBACKS");
  const parts = (raw ?? DEFAULT_OPENROUTER_FALLBACK_MODELS)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => OPENROUTER_MODEL_ID.test(part));
  return uniqueOpenRouterModelIds(parts);
}

export function openRouterModelQueue(kind: OpenRouterRequestKind): string[] {
  return buildOpenRouterModelQueue({
    kind,
    chatModel: getOpenRouterChatModel(),
    visionModel: getOpenRouterVisionModel(),
    fallbacks: getOpenRouterModelFallbacks(),
  });
}

export function openRouterModelRequestFields(kind: OpenRouterRequestKind): {
  model: string;
  models?: string[];
} {
  const models = openRouterModelQueue(kind);
  const model = models[0] ?? getOpenRouterChatModel();
  return models.length > 1 ? { model, models } : { model };
}

export const config = {
  siteUrl: "https://ailaluxe.com",
  siteName: "Aila Ecosystem",
  ai: {
    get model() {
      return getOpenRouterChatModel();
    },
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    getModeConfig(mode: AilaMode): AIModelConfig {
      const modeConfig = MODE_CONFIG[mode];
      return {
        model: getOpenRouterChatModel(),
        maxTokens: modeConfig.maxTokens,
        temperature: modeConfig.temperature,
      };
    },
  },
  documents: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["application/pdf", "text/plain"],
    maxTextLength: 14000,
  },
} as const;

export function getOpenRouterApiKey(): string | undefined {
  const value = getOptionalSecret("OPENROUTER_API_KEY");
  if (!value) return undefined;

  const key = value.replace(/^Bearer\s+/i, "").trim();
  return key || undefined;
}

export function getResendApiKey(): string | undefined {
  return getOptionalSecret("RESEND_API_KEY");
}

export function getProjectInquiryEmail(): string | undefined {
  return getOptionalSecret("PROJECT_INQUIRY_EMAIL");
}

export function getResendFromEmail(): string {
  return getOptionalSecret("RESEND_FROM_EMAIL") ?? "Aila Ecosystem <onboarding@resend.dev>";
}

export function getCronSecret(): string | undefined {
  return getOptionalSecret("CRON_SECRET");
}

export function getClerkWebhookSecret(): string | undefined {
  return getOptionalSecret("CLERK_WEBHOOK_SIGNING_SECRET");
}

export function getAppUrl(): string {
  if (process.env.NODE_ENV === "development") {
    const configured = publicEnv.NEXT_PUBLIC_APP_URL;
    if (configured.startsWith("http://localhost") || configured.startsWith("http://127.0.0.1")) {
      return configured;
    }
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_URL && process.env.VERCEL_ENV !== "production") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return publicEnv.NEXT_PUBLIC_APP_URL;
}
