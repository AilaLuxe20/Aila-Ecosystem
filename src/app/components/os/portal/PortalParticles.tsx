"use client";

export default function PortalParticles() {
  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-cyan-300 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </>
  );
}