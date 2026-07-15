"use client";

import { SearchX } from "lucide-react";
import GlowButton from "./GlowButton";

type EmptyStateProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function EmptyState({
  title = "Nothing Here Yet",
  description = "There's currently no content available.",
  buttonText = "Go Home",
  buttonHref = "/",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-20 text-center backdrop-blur-2xl">

      <div className="mb-8 rounded-full bg-cyan-500/10 p-6">
        <SearchX className="h-14 w-14 text-cyan-400" />
      </div>

      <h2 className="text-4xl font-black">
        {title}
      </h2>

      <p className="mt-5 max-w-xl text-slate-400 leading-8">
        {description}
      </p>

      <div className="mt-10">
        <GlowButton href={buttonHref}>
          {buttonText}
        </GlowButton>
      </div>

    </div>
  );
}