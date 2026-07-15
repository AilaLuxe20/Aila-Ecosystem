"use client";

export default function HeroPortal() {
  return (
    <div className="relative mx-auto mt-24 h-[420px] w-[420px] rounded-full border border-cyan-400/20">

      <div className="absolute inset-8 rounded-full border border-cyan-400/20 animate-spin" />

      <div className="absolute inset-20 rounded-full border border-violet-400/20 animate-pulse" />

      <div className="absolute inset-32 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 blur-xl" />

    </div>
  );
}