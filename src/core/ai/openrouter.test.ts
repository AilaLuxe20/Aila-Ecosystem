import assert from "node:assert/strict";
import { test } from "node:test";

import { openRouterUserMessage } from "./openrouter";

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
});
