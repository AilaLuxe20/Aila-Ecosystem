"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="select-none text-3xl font-black tracking-tight"
    >
      <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
        AILA
      </span>
    </Link>
  );
}