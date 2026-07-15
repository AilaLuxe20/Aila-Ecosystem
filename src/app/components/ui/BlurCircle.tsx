"use client";

type Props = {
  className?: string;
};

export default function BlurCircle({
  className,
}: Props) {
  return (
    <div
      className={`absolute rounded-full bg-cyan-500/10 blur-[160px] ${className}`}
    />
  );
}