"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
};

export default function GlowButton({
  href,
  children,
  className,
}: GlowButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-8 py-4 font-bold text-white transition-all duration-500",
    "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600",
    "hover:scale-105 hover:shadow-[0_0_60px_rgba(34,211,238,.45)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-white/10" />
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }

  return (
    <button className={classes}>
      <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-white/10" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}