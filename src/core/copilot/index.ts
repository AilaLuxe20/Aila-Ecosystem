/**
 * Aila Copilot Core
 *
 * Central AI copilot system for the Aila Ecosystem.
 * Provides conversational AI assistance, code generation,
 * and intelligent automation across all Aila products.
 */

export interface CopilotConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

export interface CopilotMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CopilotSession {
  id: string;
  productId: string;
  messages: CopilotMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_COPILOT_CONFIG: CopilotConfig = {
  model: "google/gemini-2.0-pro-exp-02-05",
  temperature: 0.7,
  maxTokens: 4096,
  stream: true,
};

export const COPILOT_PRODUCTS = [
  "intelligence",
  "legal",
  "business",
  "automation",
  "commerce",
  "finance",
  "social",
  "ads",
  "education",
  "shipping",
  "developer",
  "api",
  "ui-ux",
] as const;

export type CopilotProduct = (typeof COPILOT_PRODUCTS)[number];

export function isCopilotProduct(productId: string): productId is CopilotProduct {
  return COPILOT_PRODUCTS.includes(productId as CopilotProduct);
}
