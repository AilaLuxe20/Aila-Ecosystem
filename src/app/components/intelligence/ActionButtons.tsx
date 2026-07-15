"use client";

import VoiceButton from "./VoiceButton";
import VisionButton from "./VisionButton";

export default function ActionButtons() {
  return (
    <div className="mt-6 flex gap-4">
      <VoiceButton />
      <VisionButton />
    </div>
  );
}