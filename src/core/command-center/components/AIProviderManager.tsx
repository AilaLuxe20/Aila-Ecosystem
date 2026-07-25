"use client";

import { useEffect, useState } from "react";
import type { AIProvider } from "@/core/command-center/types";

const PROVIDERS: AIProvider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    type: "openrouter",
    status: "unknown",
    model: "openai/gpt-4o-mini",
    endpoint: "https://openrouter.ai/api/v1",
  },
  {
    id: "openai",
    name: "OpenAI",
    type: "openai",
    status: "unknown",
    model: "gpt-4o",
    endpoint: "https://api.openai.com/v1",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    type: "anthropic",
    status: "unknown",
    model: "claude-3-5-sonnet",
    endpoint: "https://api.anthropic.com",
  },
];

export default function AIProviderManager() {
  const [providers, setProviders] = useState<AIProvider[]>(PROVIDERS);

  useEffect(() => {
    const checkProviders = async () => {
        const updated = await Promise.all(
          PROVIDERS.map(async (p) => {
          try {
            const res = await fetch(
              `/api/command-center/providers/${p.id}/status`
            );
            const data = await res.json();
            return {
              ...p,
              status: data.status || "unknown",
              lastChecked: new Date(),
            };
          } catch {
            return {
              ...p,
              status: "disconnected" as const,
              lastChecked: new Date(),
            };
          }
        })
      );
      setProviders(updated);
    };

    checkProviders();
    const interval = setInterval(checkProviders, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: AIProvider["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-400";
      case "error":
        return "bg-red-400";
      case "disconnected":
        return "bg-gray-500";
      default:
        return "bg-yellow-400";
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#080808]/80 p-8 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        AI Providers
      </h2>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/30 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${statusColor(provider.status)} shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                />
              </div>

              <div>
                <p className="font-medium text-white">
                  {provider.name}
                </p>
                <p className="text-xs text-neutral-600">
                  {provider.model}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                  provider.status === "connected"
                    ? "bg-green-500/10 text-green-400"
                    : provider.status === "error"
                      ? "bg-red-500/10 text-red-400"
                      : provider.status === "disconnected"
                        ? "bg-gray-500/10 text-gray-400"
                        : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {provider.status}
              </span>
              {provider.lastChecked && (
                <p className="mt-1 text-xs text-neutral-700">
                  {new Date(provider.lastChecked).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
