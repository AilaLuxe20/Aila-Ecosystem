"use client";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        `
        relative
        overflow-hidden
        rounded-2xl
        bg-white/5
        before:absolute
        before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r
        before:from-transparent
        before:via-white/10
        before:to-transparent
        `,
        className
      )}
    />
  );
}