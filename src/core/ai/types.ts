/**
 * AI engine types for the single Aila AI engine.
 */

import type { ChatMessage, AilaMode } from "@/core/types";

export interface AIRequest {
  mode: AilaMode;
  messages: ChatMessage[];
  conversationId?: string;
  sessionId?: string;
  documentText?: string;
  documentName?: string;
  /** Intelligence attachments only. Never taken from the client document body. */
  documentKind?: string;
  documentToolText?: string;
  /** Authenticated Prisma user id. Required before Intelligence tools run. */
  userId?: string;
  /** Server-loaded Daily snapshot. Never taken from the client. */
  workspaceContext?: string;
}

export interface AIResponse {
  success: boolean;
  reply: string;
  error?: string;
}

export interface AIStreamChunk {
  content: string;
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
