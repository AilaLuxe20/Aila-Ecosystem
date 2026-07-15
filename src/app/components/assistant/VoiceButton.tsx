"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

type Props = {
  transcriptAction: (text: string) => void;
};

export default function VoiceButton({
  transcriptAction,
}: Props) {
  const {
    mounted,
    transcript,
    listening,
    start,
    stop,
    browserSupportsSpeechRecognition,
  } = useVoice();

  if (!mounted) {
    return (
      <button
        disabled
        className="w-full rounded-3xl bg-[#0d1729] py-5 font-bold opacity-60"
      >
        Loading Voice...
      </button>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <button
        disabled
        className="w-full rounded-3xl bg-red-500 py-5 font-bold"
      >
        Voice Not Supported
      </button>
    );
  }

  function toggle() {
    if (listening) {
      stop();

      if (transcript.trim()) {
        transcriptAction(transcript);
      }
    } else {
      start();
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center justify-center gap-3 rounded-3xl bg-cyan-500 py-5 text-lg font-bold transition hover:bg-cyan-400"
    >
      {listening ? <MicOff size={24} /> : <Mic size={24} />}

      {listening ? "Stop Listening" : "Start Voice"}
    </button>
  );
}
