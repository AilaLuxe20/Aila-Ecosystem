"use client";

import { cn } from "@/lib/utils";

export default function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[36px] border border-white/10 bg-white/[0.04] p-10 backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}