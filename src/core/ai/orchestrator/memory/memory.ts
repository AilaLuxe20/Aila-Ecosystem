import type { ChatMessage } from "@/core/types";

const conversations = new Map<string, ChatMessage[]>();

export function loadMemory(sessionId: string): ChatMessage[] {
  return conversations.get(sessionId) ?? [];
}

export function saveMemory(
  sessionId: string,
  messages: ChatMessage[]
): void {
  conversations.set(sessionId, messages);
}

export function appendMemory(
  sessionId: string,
  message: ChatMessage
): ChatMessage[] {
  const history = loadMemory(sessionId);
  const updated = [...history, message];
  conversations.set(sessionId, updated);
  return updated;
}

export function clearMemory(sessionId: string): void {
  conversations.delete(sessionId);
}

export function hasMemory(sessionId: string): boolean {
  return conversations.has(sessionId);
}
