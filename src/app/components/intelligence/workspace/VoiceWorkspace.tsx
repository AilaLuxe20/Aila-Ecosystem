"use client";

import VoiceButton from "@/app/components/assistant/VoiceButton";
import { useState } from "react";

export default function VoiceWorkspace() {
  const [text, setText] = useState("");

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#07101f]/70 p-8">

      <VoiceButton transcriptAction={setText} />

      <textarea
        value={text}
        readOnly
        placeholder="Your voice transcript will appear here..."
        className="h-48 w-full rounded-2xl border border-white/10 bg-[#0d1729] p-4 text-white outline-none"
      />

    </div>
  );
}
