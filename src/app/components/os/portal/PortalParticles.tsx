"use client";

const particlePositions = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 41 + 13) % 100}%`,
  top: `${(i * 67 + 19) % 100}%`,
}));

export default function PortalParticles() {
  return (
    <>
      {particlePositions.map((position, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-cyan-300 animate-pulse"
          style={position}
        />
      ))}
    </>
  );
}
