"use client";

export default function HeroGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}