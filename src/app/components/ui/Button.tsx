"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold transition-all duration-300",
        "bg-gradient-to-r from-cyan-500 to-blue-600",
        "text-white",
        "hover:scale-105",
        "hover:shadow-[0_0_40px_rgba(34,211,238,.35)]",
        className
      )}
    >
      {children}
    </button>
  );
}