"use client";

export default function AilaOrb() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">

      <div className="absolute h-24 w-24 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />

      <div className="absolute h-16 w-16 rounded-full border border-cyan-400/50 bg-cyan-500/10" />

      <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/30" />

      <div className="relative h-6 w-6 rounded-full bg-cyan-300 shadow-[0_0_40px_#22d3ee]" />

    </div>
  );
}
