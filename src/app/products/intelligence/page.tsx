"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: Message = {
  role: "assistant",
  content: "Welcome. I am Aila Intelligence, the intelligence layer of the Aila Ecosystem. Tell me what you want to build, improve or automate.",
};

export default function AilaIntelligencePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customMessage?: string) {
    const content = (customMessage || input).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Connection failed");

      const data = await response.json();
      setMessages((prev: Message[]) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "assistant", content: "I am currently experiencing technical difficulties." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#030303] text-white p-10">
       {/* UI code remains as per your design */}
    </main>
  );
}