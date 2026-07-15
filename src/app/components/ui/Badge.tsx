"use client";

import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Badge({
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        `
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-cyan-500/20
        bg-cyan-500/10
        px-5
        py-2
        text-xs
        font-bold
        uppercase
        tracking-[0.35em]
        text-cyan-300
        backdrop-blur-xl
        `,
        className
      )}
    >
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      {children}
    </span>
  );
}