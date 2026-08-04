import type { ChatMessage } from "@/core/types";

interface Session {
  id: string;
  messages: ChatMessage[];
}

const sessions = new Map<string, Session>();

export function getSession(id: string): ChatMessage[] {
  return sessions.get(id)?.messages ?? [];
}

export function saveSession(id: string, messages: ChatMessage[]): void {
  sessions.set(id, { id, messages });
}

export function getSessions(): Session[] {
  return [...sessions.values()];
}

export function createSession(id: string): void {
  if (!sessions.has(id)) {
    sessions.set(id, { id, messages: [] });
  }
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}
