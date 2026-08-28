/**
 * Core configuration for the Aila Ecosystem.
 */

import { AI_MODEL, MODE_CONFIG } from "@/core/constants";
import type { AIModelConfig, AilaMode } from "@/core/types";
import { getOptionalSecret, publicEnv } from "@/lib/config/env";

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
  return getOptionalSecret("OPENROUTER_API_KEY");
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

export function getStripeSecretKey(): string | undefined {
  return getOptionalSecret("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string | undefined {
  return getOptionalSecret("STRIPE_WEBHOOK_SECRET");
}

export function getStripeProPriceId(): string | undefined {
  return getOptionalSecret("STRIPE_PRICE_PRO");
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
