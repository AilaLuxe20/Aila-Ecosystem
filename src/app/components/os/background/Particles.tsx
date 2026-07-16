"use client";

const particlePositions = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 17) % 100}%`,
}));

export default function Particles() {
  return (
    <div className="absolute inset-0">

      {particlePositions.map((position, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-300/60 animate-pulse"
          style={position}
        />
      ))}

    </div>
  );
}
