import assert from "node:assert/strict";
import { test } from "node:test";

import { fetchOpenRouterChatCompletion, isOpenRouterModelRetryable, openRouterUserMessage } from "./openrouter";

test("provider auth failures do not name environment variables", () => {
  const chat = openRouterUserMessage({ status: 401 }, "chat");
  const document = openRouterUserMessage({ status: 403 }, "document");

  assert.equal(chat.includes("OPENROUTER"), false);
  assert.equal(document.includes("OPENROUTER"), false);
  assert.equal(chat.includes("API_KEY"), false);
  assert.equal(document.includes("API_KEY"), false);
});

test("rate-limit and credit failures stay generic", () => {
  assert.match(openRouterUserMessage({ status: 429 }, "chat"), /rate-limiting/i);
  assert.match(openRouterUserMessage({ status: 402 }, "chat"), /credits/i);
  assert.match(openRouterUserMessage({ status: 402 }, "chat"), /openrouter\/free/i);
});

test("privacy-policy misses explain that free endpoints were excluded", () => {
  assert.match(
    openRouterUserMessage(
      { status: 404, message: "ZDR violation (account settings): 8 endpoints excluded" },
      "chat",
    ),
    /privacy/i,
  );
});

test("retryable OpenRouter statuses cover model and quota misses", () => {
  assert.equal(isOpenRouterModelRetryable(404), true);
  assert.equal(isOpenRouterModelRetryable(402), true);
  assert.equal(isOpenRouterModelRetryable(429), true);
  assert.equal(isOpenRouterModelRetryable(500), true);
  assert.equal(isOpenRouterModelRetryable(401), false);
  assert.equal(isOpenRouterModelRetryable(400, "No endpoints found for model"), true);
  assert.equal(isOpenRouterModelRetryable(400, "invalid json"), false);
});

test("sequential OpenRouter models skip retryable failures", async () => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    const payload = JSON.parse(String(init?.body ?? "{}")) as { model?: string };
    calls.push(payload.model ?? "");
    if (payload.model === "first-model") {
      return new Response(JSON.stringify({ error: { message: "No endpoints found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await fetchOpenRouterChatCompletion({
      apiKey: "sk-or-v1-test",
      payload: {
        model: "first-model",
        models: ["first-model", "second-model"],
        messages: [{ role: "user", content: "hi" }],
      },
    });
    assert.equal(response.ok, true);
    assert.deepEqual(calls, ["first-model", "second-model"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
