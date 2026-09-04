import type { ChatMessage } from "@/core/types";

export interface IntelligenceAttachmentSummary {
  id: string;
  fileName: string;
  fileSize: number;
  kind: string;
  truncated: boolean;
  extractedCharCount: number;
}

export interface Conversation {
  id: string;
  mode: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  attachments: IntelligenceAttachmentSummary[];
}

export interface ConversationSummary {
  id: string;
  mode: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
