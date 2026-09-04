"use client";

import { Component, type ReactNode } from "react";
import type { ChatMessage } from "@/core/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

type ChatMessageProps = {
  message: ChatMessage;
};

class AssistantMarkdownBoundary extends Component<
  { content: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps: { content: string; children: ReactNode }) {
    if (this.state.failed && prevProps.content !== this.props.content) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="whitespace-pre-wrap break-words">{this.props.content}</p>
      );
    }

    return this.props.children;
  }
}

/**
 * Renders a single chat message bubble.
 *
 * User messages stay plain text. Assistant messages use the shared
 * MarkdownRenderer so replies can include lists, tables, and code.
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const content = typeof message.content === "string" ? message.content : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] min-w-0 overflow-x-auto rounded-3xl px-5 py-4 text-sm leading-7 sm:max-w-[80%] ${
          isUser
            ? "rounded-br-md bg-white text-black"
            : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-neutral-300"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : content.trim() ? (
          <AssistantMarkdownBoundary content={content}>
            <MarkdownRenderer content={content} className="text-neutral-300" />
          </AssistantMarkdownBoundary>
        ) : null}
      </div>
    </div>
  );
}
