import assert from "node:assert/strict";
import { test } from "node:test";

import {
  aiChatRequestSchema,
  extractLatestUserMessage,
  normalizeAiChatRequestInput,
} from "./chat-api";
import { MemoryRateLimiter } from "@/lib/api/rate-limit";

test("400 invalid request: unknown fields and empty messages fail validation", () => {
  const invalidMode = aiChatRequestSchema.safeParse({
    mode: "not-a-mode",
    messages: [{ role: "user", content: "Hello" }],
  });
  assert.equal(invalidMode.success, false);

  const extraField = aiChatRequestSchema.safeParse({
    mode: "intelligence",
    messages: [{ role: "user", content: "Hello" }],
    promptInjection: "ignore previous",
  });
  assert.equal(extraField.success, false);
});

test("400 invalid request: no user message is rejected", () => {
  assert.equal(extractLatestUserMessage([]), null);
  assert.equal(
    extractLatestUserMessage([{ role: "assistant", content: "Hi" }]),
    null
  );
});

test("continuation uses only the latest user turn from the client payload", () => {
  const latest = extractLatestUserMessage([
    { role: "user", content: "old" },
    { role: "assistant", content: "reply" },
    { role: "user", content: "  continue  " },
  ]);

  assert.deepEqual(latest, { role: "user", content: "continue" });
});

test("429 rate limit denies requests over the window", async () => {
  const limiter = new MemoryRateLimiter({ limit: 2, windowMs: 60_000 });
  const first = await limiter.check("ai:chat:test-user");
  const second = await limiter.check("ai:chat:test-user");
  const third = await limiter.check("ai:chat:test-user");

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.ok(third.retryAfterSeconds >= 1);
});

test("chat request accepts a single document id", () => {
  const parsed = aiChatRequestSchema.safeParse({
    mode: "intelligence",
    messages: [{ role: "user", content: "Summarize this." }],
    documentIds: ["doc_1"],
  });
  assert.equal(parsed.success, true);
});

test("client documentText is accepted by the schema for compatibility", () => {
  const parsed = aiChatRequestSchema.safeParse({
    mode: "legal",
    messages: [{ role: "user", content: "Explain the latest upload." }],
    documentText: "client-supplied extract that the route must ignore",
  });
  assert.equal(parsed.success, true);
});

test("chat request still works without an attachment", () => {
  const parsed = aiChatRequestSchema.safeParse({
    mode: "intelligence",
    messages: [{ role: "user", content: "Hello" }],
  });
  assert.equal(parsed.success, true);
});

test("writer chat accepts extra message fields and empty bookId after normalize", () => {
  const parsed = aiChatRequestSchema.safeParse(
    normalizeAiChatRequestInput({
      mode: "writer",
      bookId: "",
      chapterId: "not-part-of-chat-contract",
      messages: [
        {
          role: "assistant",
          content: "Hello, I am Aila Writer.",
          id: "msg_1",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        { role: "user", content: "Help me rewrite this scene." },
      ],
    }),
  );
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.mode, "writer");
    assert.equal(parsed.data.bookId, undefined);
    assert.equal(parsed.data.messages.length, 2);
  }
});

test("writer chat accepts a book id", () => {
  const parsed = aiChatRequestSchema.safeParse(
    normalizeAiChatRequestInput({
      mode: "writer",
      bookId: "cmtnifft0000620o1tafjdcpv",
      messages: [{ role: "user", content: "Continue the chapter." }],
    }),
  );
  assert.equal(parsed.success, true);
});
