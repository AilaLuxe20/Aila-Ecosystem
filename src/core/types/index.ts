/**
 * Core shared types used across the Aila Ecosystem.
 */

export type AilaMode =
  | "intelligence"
  | "daily"
  | "legal"
  | "business"
  | "automation"
  | "ads"
  | "apps"
  | "calendar"
  | "commerce"
  | "flow"
  | "sites";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AIModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface DocumentResult {
  fileName: string;
  pages: number;
  text: string;
  size: number;
  type: string;
}

export interface AnalysisResult {
  summary: string;
  riskScore: string;
  risks: string[];
  keyClauses: string[];
  recommendations: string[];
}
