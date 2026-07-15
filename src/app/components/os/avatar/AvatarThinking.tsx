"use client";

export default function AvatarThinking() {
  return (
    <div className="absolute -right-2 -top-2 flex gap-1 rounded-full bg-black/70 px-3 py-2 backdrop-blur-xl">

      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />

      <span
        className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: ".2s" }}
      />

      <span
        className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: ".4s" }}
      />

    </div>
  );
}