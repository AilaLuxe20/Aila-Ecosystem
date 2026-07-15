"use client";

export default function AvatarVoice({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">

      <div
        className={`absolute rounded-full border border-cyan-400/30 ${
          active ? "animate-ping" : ""
        }`}
        style={{
          width: 170,
          height: 170,
        }}
      />

      <div
        className={`absolute rounded-full border border-violet-400/20 ${
          active ? "animate-pulse" : ""
        }`}
        style={{
          width: 210,
          height: 210,
        }}
      />

    </div>
  );
}