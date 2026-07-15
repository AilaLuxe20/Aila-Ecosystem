"use client";

import { cn } from "@/lib/utils";

type DividerProps = {
  className?: string;
};

export default function Divider({
  className,
}: DividerProps) {
  return (
    <div
      className={cn(
        "relative my-12 h-px w-full overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]" />
    </div>
  );
}