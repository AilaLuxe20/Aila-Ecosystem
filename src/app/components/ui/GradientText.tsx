"use client";

import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GradientText({
  children,
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        `
        bg-gradient-to-r
        from-[#FFE8A3]
        via-[#B88BFF]
        to-[#22D3EE]
        bg-clip-text
        text-transparent
        animate-gradient
        `,
        className
      )}
    >
      {children}
    </span>
  );
}