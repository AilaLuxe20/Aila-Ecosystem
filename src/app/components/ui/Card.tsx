"use client";

import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        `
        group
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-white/10
        bg-gradient-to-br
        from-white/[0.06]
        to-white/[0.02]
        p-8
        backdrop-blur-2xl
        transition-all
        duration-500
        hover:-translate-y-3
        hover:border-cyan-400/40
        hover:shadow-[0_0_80px_rgba(34,211,238,.18)]
        `,
        className
      )}
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.12),transparent_70%)]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}