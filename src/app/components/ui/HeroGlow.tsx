"use client";

export default function HeroGlow() {
  return (
    <>
      <div className="absolute left-[-180px] top-[-180px] h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[180px]" />

      <div className="absolute right-[-200px] top-20 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[180px]" />
    </>
  );
}