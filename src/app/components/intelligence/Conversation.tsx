"use client";

import MessageBubble from "./MessageBubble";

const messages = [
  {
    role: "assistant" as const,
    message: "Welcome to Aila Intelligence.",
  },
  {
    role: "user" as const,
    message: "Build me an AI platform.",
  },
];

export default function Conversation() {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          role={message.role}
          message={message.message}
        />
      ))}
    </div>
  );
}