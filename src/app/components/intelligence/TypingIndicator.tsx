"use client";

export default function TypingIndicator() {
  return (
    <div className="flex gap-2 py-4">

      <span className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce" />

      <span
        className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: ".2s" }}
      />

      <span
        className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: ".4s" }}
      />

    </div>
  );
}