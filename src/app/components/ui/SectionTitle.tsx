"use client";

import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        center && "text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">
          {eyebrow}
        </span>
      )}

      <h2 className="mt-6 text-5xl font-black leading-tight md:text-6xl">
        <GradientText>{title}</GradientText>
      </h2>

      {subtitle && (
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}