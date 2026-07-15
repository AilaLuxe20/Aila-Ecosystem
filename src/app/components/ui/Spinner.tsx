"use client";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  className?: string;
};

export default function Spinner({
  size = 42,
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      <span
        className="absolute rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"
        style={{
          width: size,
          height: size,
        }}
      />

      <span
        className="absolute rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]"
        style={{
          width: size / 4,
          height: size / 4,
        }}
      />
    </div>
  );
}