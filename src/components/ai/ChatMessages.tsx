"use client";

import type { RefObject } from "react";
import type { ChatMessage } from "@/core/types";
import ChatMessageComponent from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

type ChatMessagesProps = {
  messages: ChatMessage[];
  typing: boolean;
  messagesHeight?: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
};

/**
 * Container that renders the full list of chat messages,
 * the typing indicator (when active), and a sentinel ref
 * used to auto-scroll to the bottom.
 */
export default function ChatMessages({
  messages,
  typing,
  messagesHeight = "h-[400px]",
  chatEndRef,
}: ChatMessagesProps) {
  return (
    <div className={`${messagesHeight} space-y-5 overflow-y-auto p-5 sm:p-6`}>
      {messages.map((message, index) => (
        <ChatMessageComponent
          key={`${message.role}-${index}`}
          message={message}
        />
      ))}

      {typing && <TypingIndicator />}

      <div ref={chatEndRef} />
    </div>
  );
}
