import type { ChatMessage } from "@/core/types";

const sessions = new Map<string, ChatMessage[]>();

export function saveSession(id: string, messages: ChatMessage[]) {

    sessions.set(id, messages);

}

export function getSession(id: string): ChatMessage[] {

    return sessions.get(id) ?? [];

}

export function createSession(id: string) {

    if (!sessions.has(id)) {
        sessions.set(id, []);
    }

}

export function getSessions() {

    return [...sessions.keys()];

}

export function deleteSession(id: string) {

    sessions.delete(id);

}
