"use client";

import { useState } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function AilaLegalChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello, I am AilaLegal AI. Ask me about contracts, documents, or legal risks.",
    },
  ]);


  async function sendMessage() {
    if (!input.trim()) return;


    const userMessage = input;


    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userMessage,
      },
    ]);


    setInput("");
    setLoading(true);


    try {
      const response = await fetch(
        "/products/ailalegal/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );


      const data = await response.json();


      setMessages((previous) => [
        ...previous,
        {
          role: "ai",
          text:
            data.reply ||
            "No response received from AilaLegal AI.",
        },
      ]);


    } catch {

      setMessages((previous) => [
        ...previous,
        {
          role: "ai",
          text: "AilaLegal AI is currently unavailable.",
        },
      ]);

    }


    setLoading(false);
  }



  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">

      <h2 className="text-2xl font-semibold">
        AilaLegal AI Assistant
      </h2>


      <p className="mt-2 text-gray-400">
        AI-powered legal conversation workspace.
      </p>


      <div className="mt-6 h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-5 space-y-4">

        {messages.map((message, index) => (
          <div key={index}>

            <div
              className={
                message.role === "user"
                  ? "ml-auto max-w-xl rounded-xl bg-white p-4 text-black"
                  : "max-w-xl rounded-xl bg-white/10 p-4 text-gray-200"
              }
            >
              {message.text}
            </div>

          </div>
        ))}


        {loading && (
          <div className="text-gray-500">
            AilaLegal AI is analyzing...
          </div>
        )}

      </div>


      <div className="mt-5 flex gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AilaLegal AI..."
          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
        />


        <button
          onClick={sendMessage}
          className="rounded-xl bg-white px-6 py-3 text-black"
        >
          Send
        </button>

      </div>

    </div>
  );
}