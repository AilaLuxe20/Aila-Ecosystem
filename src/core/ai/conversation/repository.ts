import { prisma } from "@/core/database/prisma";
import type { AilaMode, ChatMessage } from "@/core/types";

function toChatMessage(message: { role: string; content: string }): ChatMessage | null {
  if (message.role !== "user" && message.role !== "assistant") {
    return null;
  }

  return {
    role: message.role,
    content: message.content,
  };
}

function titleFromMessage(content: string): string {
  const title = content.trim().replace(/\s+/g, " ").slice(0, 80);
  return title || "New conversation";
}

export async function createConversationForUser(
  userId: string,
  mode: AilaMode,
  firstMessage?: ChatMessage
) {
  return prisma.conversation.create({
    data: {
      userId,
      mode,
      title: firstMessage ? titleFromMessage(firstMessage.content) : "New conversation",
    },
  });
}

export async function findConversationForUser(userId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function listConversationsForUser(
  userId: string,
  mode?: AilaMode
) {
  return prisma.conversation.findMany({
    where: {
      userId,
      ...(mode ? { mode } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
}

export async function appendMessagesToConversation(
  conversationId: string,
  messages: ChatMessage[]
) {
  if (messages.length === 0) {
    return;
  }

  await prisma.$transaction([
    prisma.message.createMany({
      data: messages.map((message) => ({
        conversationId,
        role: message.role,
        content: message.content,
      })),
    }),
    prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);
}

export async function deleteConversationForUser(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!conversation) {
    return false;
  }

  await prisma.conversation.delete({
    where: {
      id: conversation.id,
    },
  });

  return true;
}

export function mapPersistedConversation(
  conversation: Awaited<ReturnType<typeof findConversationForUser>>
) {
  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    mode: conversation.mode,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages
      .map(toChatMessage)
      .filter((message): message is ChatMessage => message !== null),
  };
}
