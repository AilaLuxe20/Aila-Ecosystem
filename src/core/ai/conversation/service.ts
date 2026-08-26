import type { AilaMode, ChatMessage } from "@/core/types";

import {
  appendMessagesToConversation,
  createConversationForUser,
  deleteConversationForUser,
  findConversationForUser,
  listConversationsForUser,
  mapPersistedConversation,
} from "./repository";
import type { ConversationSummary } from "./types";

export async function getUserConversation(userId: string, conversationId: string) {
  return mapPersistedConversation(
    await findConversationForUser(userId, conversationId)
  );
}

export async function getUserConversationMessages(
  userId: string,
  conversationId: string
): Promise<ChatMessage[] | null> {
  const conversation = await getUserConversation(userId, conversationId);
  return conversation?.messages ?? null;
}

export async function listUserConversations(
  userId: string,
  mode?: AilaMode
): Promise<ConversationSummary[]> {
  const conversations = await listConversationsForUser(userId, mode);

  return conversations.map((conversation) => ({
    id: conversation.id,
    mode: conversation.mode,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messageCount: conversation._count.messages,
  }));
}

export async function ensureUserConversation({
  userId,
  conversationId,
  mode,
  firstMessage,
}: {
  userId: string;
  conversationId?: string;
  mode: AilaMode;
  firstMessage?: ChatMessage;
}) {
  if (conversationId) {
    const existing = await findConversationForUser(userId, conversationId);

    if (existing) {
      return existing;
    }

    return null;
  }

  return createConversationForUser(userId, mode, firstMessage);
}

/** Creates a conversation for the authenticated user (used after AI succeeds). */
export async function createUserConversation(
  userId: string,
  mode: AilaMode,
  firstMessage?: ChatMessage
) {
  return createConversationForUser(userId, mode, firstMessage);
}

export async function appendConversationMessages(
  conversationId: string,
  messages: ChatMessage[]
) {
  await appendMessagesToConversation(conversationId, messages);
}

export async function deleteUserConversation(userId: string, conversationId: string) {
  return deleteConversationForUser(userId, conversationId);
}
