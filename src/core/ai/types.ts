/**
 * AI engine types for the single Aila AI engine.
 */

import type { ChatMessage, AilaMode } from "@/core/types";

export interface AIRequest {
  mode: AilaMode;
  messages: ChatMessage[];
  documentText?: string;
  documentName?: string;
}

export interface AIResponse {
  success: boolean;
  reply: string;
  error?: string;
}

export interface AIPromptConfig {
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}

export interface DocumentContext {
  fileName: string;
  text: string;
}
