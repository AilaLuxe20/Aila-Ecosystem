"use client";

import GlowButton from "../ui/GlowButton";
import Link from "next/link";

export default function HeroButtons() {
  return (
    <div className="mt-12 flex flex-wrap justify-center gap-6">
      <GlowButton href="/contact">
        Start Your Project
      </GlowButton>

      <Link
        href="/products"
        className="rounded-2xl border border-white/10 px-8 py-4 font-semibold hover:border-cyan-400"
      >
        Explore Products
      </Link>
    </div>
  );
}