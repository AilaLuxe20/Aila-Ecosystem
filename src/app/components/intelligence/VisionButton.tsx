"use client";

import { Camera } from "lucide-react";

export default function VisionButton() {
  return (
    <button className="rounded-2xl bg-violet-600 p-4 text-white transition hover:scale-105">
      <Camera className="h-6 w-6" />
    </button>
  );
}