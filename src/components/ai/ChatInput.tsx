"use client";

import type { KeyboardEvent } from "react";

type ChatInputProps = {
  input: string;
  placeholder: string;
  typing: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

/**
 * The textarea + send button at the bottom of the chat.
 *
 * The parent is responsible for handling the Enter key
 * (without Shift) and calling `onSend`.
 */
export default function ChatInput({
  input,
  placeholder,
  typing,
  onChange,
  onSend,
  onKeyDown,
}: ChatInputProps) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-cyan-300/25">
        <textarea
          value={input}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          className="min-w-0 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!input.trim() || typing}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </div>
  );
}
