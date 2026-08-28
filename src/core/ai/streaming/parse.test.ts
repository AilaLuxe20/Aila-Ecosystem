import assert from "node:assert/strict";
import { test } from "node:test";

import {
  encodeSseData,
  iterateAilaSse,
  iterateOpenRouterSse,
  parseAilaSseBlock,
  parseOpenRouterSseLine,
  splitSseBlocks,
} from "./parse";

test("parses OpenRouter token deltas from data lines", () => {
  const event = parseOpenRouterSseLine(
    'data: {"choices":[{"delta":{"content":"Hello"}}]}'
  );

  assert.deepEqual(event, { type: "delta", content: "Hello" });
});

test("parses OpenRouter [DONE] as completion", () => {
  assert.deepEqual(parseOpenRouterSseLine("data: [DONE]"), { type: "done" });
});

test("ignores comments, empty lines, and malformed JSON", () => {
  assert.equal(parseOpenRouterSseLine(""), null);
  assert.equal(parseOpenRouterSseLine(": keep-alive"), null);
  assert.equal(parseOpenRouterSseLine("data: {not-json"), null);
  assert.equal(
    parseOpenRouterSseLine('data: {"choices":[{"delta":{}}]}'),
    null
  );
});

test("does not invent tokens from a completed reply string", () => {
  const event = parseOpenRouterSseLine(
    'data: {"choices":[{"delta":{"content":"one two three"}}]}'
  );

  assert.deepEqual(event, { type: "delta", content: "one two three" });
});

test("encodes and parses Aila SSE done and error events", () => {
  const done = parseAilaSseBlock(
    encodeSseData({
      type: "done",
      conversationId: "conv_1",
      sessionId: "conv_1",
      reply: "Hi",
    }).trim()
  );

  assert.deepEqual(done, {
    type: "done",
    conversationId: "conv_1",
    sessionId: "conv_1",
    reply: "Hi",
  });

  const error = parseAilaSseBlock(
    encodeSseData({
      type: "error",
      error: { code: "EXTERNAL_SERVICE_ERROR", message: "Unavailable." },
    }).trim()
  );

  assert.deepEqual(error, {
    type: "error",
    error: { code: "EXTERNAL_SERVICE_ERROR", message: "Unavailable." },
  });
});

test("splits SSE blocks without dropping a trailing partial", () => {
  const { blocks, rest } = splitSseBlocks(
    'data: {"type":"delta","content":"A"}\n\ndata: {"type":"delta","content":"B"}'
  );

  assert.equal(blocks.length, 1);
  assert.match(rest, /content":"B"/);
});

test("iterates a real OpenRouter SSE byte stream", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode('data: {"choices":[{"delta":{"content":"Hel"}}]}\n')
      );
      controller.enqueue(
        encoder.encode('data: {"choices":[{"delta":{"content":"lo"}}]}\n\n')
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  const events = [];

  for await (const event of iterateOpenRouterSse(body)) {
    events.push(event);
  }

  assert.deepEqual(events, [
    { type: "delta", content: "Hel" },
    { type: "delta", content: "lo" },
    { type: "done" },
  ]);
});

test("iterates Aila SSE events for the browser", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(
          encodeSseData({ type: "delta", content: "Hi" })
        )
      );
      controller.enqueue(
        encoder.encode(
          encodeSseData({
            type: "done",
            conversationId: "c1",
            sessionId: "c1",
            reply: "Hi",
          })
        )
      );
      controller.close();
    },
  });

  const events = [];

  for await (const event of iterateAilaSse(body)) {
    events.push(event);
  }

  assert.deepEqual(events, [
    { type: "delta", content: "Hi" },
    {
      type: "done",
      conversationId: "c1",
      sessionId: "c1",
      reply: "Hi",
    },
  ]);
});

test("aborts an in-flight OpenRouter SSE read", async () => {
  const abort = new AbortController();
  const body = new ReadableStream<Uint8Array>({
    start() {
      // Intentionally never enqueue — the abort must cancel the reader.
    },
    cancel() {},
  });

  const pending = iterateOpenRouterSse(body, abort.signal).next();
  queueMicrotask(() => abort.abort());
  const result = await pending;

  assert.equal(result.done, true);
});

test("ignores missing choices, unexpected JSON, and non-string delta content", () => {
  assert.equal(parseOpenRouterSseLine("data: {\"foo\":1}"), null);
  assert.equal(parseOpenRouterSseLine("data: {\"choices\":[]}"), null);
  assert.equal(
    parseOpenRouterSseLine(
      'data: {"choices":[{"delta":{"content":["nope"]}}]}'
    ),
    null
  );
});

test("parses multiple OpenRouter data lines from one chunk", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(new Uint8Array());
      controller.enqueue(
        encoder.encode(
          'data: {"choices":[{"delta":{"content":"A"}}]}\n' +
            'data: {"choices":[{"delta":{"content":"B"}}]}\n' +
            "data: [DONE]\n\n"
        )
      );
      controller.close();
    },
  });

  const events = [];

  for await (const event of iterateOpenRouterSse(body)) {
    events.push(event);
  }

  assert.deepEqual(events, [
    { type: "delta", content: "A" },
    { type: "delta", content: "B" },
    { type: "done" },
  ]);
});

test("reassembles UTF-8 characters split across chunks", async () => {
  const payload =
    'data: {"choices":[{"delta":{"content":"é"}}]}\n\ndata: [DONE]\n\n';
  const bytes = new TextEncoder().encode(payload);
  const splitAt = bytes.indexOf(0xc3) + 1;

  assert.ok(splitAt > 0);
  assert.ok(splitAt < bytes.length);

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, splitAt));
      controller.enqueue(bytes.slice(splitAt));
      controller.close();
    },
  });

  const events = [];

  for await (const event of iterateOpenRouterSse(body)) {
    events.push(event);
  }

  assert.deepEqual(events, [
    { type: "delta", content: "é" },
    { type: "done" },
  ]);
});
