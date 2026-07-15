"use client";

import TypingIndicator from "./TypingIndicator";

export default function ThinkingPanel() {
  return (
    <div className="glass mt-6 rounded-3xl p-6">

      <p className="mb-4 text-cyan-400">
        Aila is thinking...
      </p>

      <TypingIndicator />

    </div>
  );
}