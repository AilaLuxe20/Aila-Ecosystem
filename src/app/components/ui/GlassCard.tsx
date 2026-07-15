"use client";

import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({
  children,
  className,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        `
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-2xl
        shadow-[0_20px_80px_rgba(0,0,0,.45)]
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-cyan-400/40
        hover:shadow-[0_0_80px_rgba(34,211,238,.18)]
        `,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_60%)]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}