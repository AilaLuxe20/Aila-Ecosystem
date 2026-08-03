import type { ChatMessage } from "@/core/types";

export interface Conversation {
    id: string;
    title?: string;
    messages: ChatMessage[];
}

const conversations = new Map<string, Conversation>();

export function saveConversation(id: string, messages: ChatMessage[]) {

    const existing = conversations.get(id);

    conversations.set(id, {
        id,
        title: existing?.title ?? id,
        messages
    });

}

export function getConversation(id: string): ChatMessage[] {

    return conversations.get(id)?.messages ?? [];

}

export function listConversations() {

    return [...conversations.values()];

}

export function clearConversations() {

    conversations.clear();

}

export function deleteConversation(id: string) {

    return conversations.delete(id);

}

export function renameConversation(id: string, title: string) {

    const conversation = conversations.get(id);

    if (!conversation) return false;

    conversation.title = title;

    conversations.set(id, conversation);

    return true;

}

export function getConversationIds() {

    return [...conversations.keys()];

}
