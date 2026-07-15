"use client";

import { cn } from "@/lib/utils";

type GridProps = {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
};

export default function Grid({
  children,
  className,
  cols = 3,
}: GridProps) {
  const grid =
    cols === 2
      ? "grid-cols-1 md:grid-cols-2"
      : cols === 4
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div
      className={cn(
        "grid gap-8",
        grid,
        className
      )}
    >
      {children}
    </div>
  );
}