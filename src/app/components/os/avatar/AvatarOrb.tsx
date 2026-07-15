"use client";

export default function AvatarOrb() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">

      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />

      <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-spin" />

      <div className="absolute inset-6 rounded-full border border-violet-400/30" />

      <div className="absolute inset-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_80px_rgba(34,211,238,.45)]" />

    </div>
  );
}