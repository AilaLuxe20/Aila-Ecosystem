import { getOpenRouterApiKey } from "@/core/config";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function openRouterChat(body: unknown) {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("OpenRouter request failed.");
  }

  return response.json();
}
