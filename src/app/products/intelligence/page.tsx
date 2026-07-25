"use client";

import { useState, useRef, useEffect } from "react";
type Message = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: Message = {
  role: "assistant",
  content: "Welcome. I am Aila Intelligence, the intelligence layer of the Aila Ecosystem. Tell me what you want to build, improve or automate.",
};

export default function AilaIntelligencePage() {
  const [messages] = useState<Message[]>([welcomeMessage]);
  const [loading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <main className="relative min-h-screen bg-[#030303] text-white p-10">
       {/* UI code remains as per your design */}
    </main>
  );
}