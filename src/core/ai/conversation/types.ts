import type { ChatMessage } from "@/core/types";

export interface Conversation {
  id: string;
  mode: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ConversationSummary {
  id: string;
  mode: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
