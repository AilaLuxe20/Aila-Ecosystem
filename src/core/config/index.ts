/**
 * Core configuration for the Aila Ecosystem.
 */

import { AI_MODEL, MODE_CONFIG } from "@/core/constants";
import type { AIModelConfig, AilaMode } from "@/core/types";

export const config = {
  siteUrl: "https://ailaluxe.com",
  siteName: "Aila Ecosystem",
  ai: {
    model: AI_MODEL,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    getModeConfig(mode: AilaMode): AIModelConfig {
      const modeConfig = MODE_CONFIG[mode];
      return {
        model: AI_MODEL,
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
  return process.env.OPENROUTER_API_KEY;
}

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

export function getProjectInquiryEmail(): string | undefined {
  return process.env.PROJECT_INQUIRY_EMAIL;
}
