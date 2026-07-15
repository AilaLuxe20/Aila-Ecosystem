"use client";

import { Mic } from "lucide-react";

export default function VoiceButton() {
  return (
    <button className="rounded-2xl bg-cyan-500 p-4 text-white transition hover:scale-105">
      <Mic className="h-6 w-6" />
    </button>
  );
}