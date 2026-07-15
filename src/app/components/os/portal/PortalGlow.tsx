"use client";

export default function PortalGlow() {
  return (
    <>
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-[80px]" />

      <div className="absolute inset-8 rounded-full bg-violet-500/20 blur-[60px]" />
    </>
  );
}