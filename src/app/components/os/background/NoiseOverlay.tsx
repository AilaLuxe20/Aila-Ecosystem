"use client";

export default function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle,#fff 1px,transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    />
  );
}