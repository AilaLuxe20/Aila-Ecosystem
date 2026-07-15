"use client";

export default function PortalRing() {
  return (
    <>
      <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-spin" />

      <div
        className="absolute inset-8 rounded-full border border-violet-400/20"
        style={{
          animation: "spin 12s linear infinite reverse",
        }}
      />

      <div className="absolute inset-16 rounded-full border border-cyan-300/20 animate-pulse" />
    </>
  );
}