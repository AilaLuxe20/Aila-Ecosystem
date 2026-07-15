"use client";

import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function useVoice() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  function start() {
    resetTranscript();

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  }

  function stop() {
    SpeechRecognition.stopListening();
  }

  return {
    mounted,
    transcript,
    listening,
    start,
    stop,
    browserSupportsSpeechRecognition:
      mounted && browserSupportsSpeechRecognition,
  };
}
