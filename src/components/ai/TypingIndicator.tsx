"use client";

/**
 * Visual indicator shown while the assistant is "typing".
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-5 py-4">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 [animation-delay:300ms]" />
        </div>
        <span className="text-xs text-neutral-600">
          Aila is typing...
        </span>
      </div>
    </div>
  );
}
