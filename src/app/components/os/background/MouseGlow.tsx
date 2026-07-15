"use client";

export default function MouseGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,.06),transparent_60%)]" />
  );
}