"use client";

export default function Particles() {
  return (
    <div className="absolute inset-0">

      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-300/60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

    </div>
  );
}