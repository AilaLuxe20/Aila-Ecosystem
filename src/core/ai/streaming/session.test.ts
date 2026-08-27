import assert from "node:assert/strict";
import { test } from "node:test";

import { runStreamingChatSession } from "./session";
import type { AilaChatStreamEvent } from "./parse";

async function* fromEvents(
  events: Array<{ type: "delta"; content: string } | { type: "done" } | { type: "error"; error: string }>
) {
  for (const event of events) {
    yield event;
  }
}

test("normal completion forwards deltas and persists once", async () => {
  const emitted: AilaChatStreamEvent[] = [];
  let persistCalls = 0;

  await runStreamingChatSession({
    signal: new AbortController().signal,
    emit: (event) => {
      emitted.push(event);
    },
    generate: fromEvents([
      { type: "delta", content: "Hel" },
      { type: "delta", content: "lo" },
      { type: "done" },
    ]),
    persist: async (reply) => {
      persistCalls += 1;
      assert.equal(reply, "Hello");
      return { conversationId: "conv_1", sessionId: "conv_1" };
    },
  });

  assert.equal(persistCalls, 1);
  assert.deepEqual(emitted, [
    { type: "delta", content: "Hel" },
    { type: "delta", content: "lo" },
    {
      type: "done",
      conversationId: "conv_1",
      sessionId: "conv_1",
      reply: "Hello",
    },
  ]);
});

test("empty completed stream is not persisted", async () => {
  const emitted: AilaChatStreamEvent[] = [];
  let persistCalls = 0;

  await runStreamingChatSession({
    signal: new AbortController().signal,
    emit: (event) => {
      emitted.push(event);
    },
    generate: fromEvents([{ type: "done" }]),
    persist: async () => {
      persistCalls += 1;
      return { conversationId: "conv_1", sessionId: "conv_1" };
    },
  });

  assert.equal(persistCalls, 0);
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0]?.type, "error");
});

test("stop/abort during generation is not persisted", async () => {
  const abort = new AbortController();
  let persistCalls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const running = runStreamingChatSession({
    signal: abort.signal,
    emit: () => {},
    generate: (async function* () {
      yield { type: "delta" as const, content: "Hel" };
      await gate;
      yield { type: "delta" as const, content: "lo" };
      yield { type: "done" as const };
    })(),
    persist: async () => {
      persistCalls += 1;
      return { conversationId: "conv_1", sessionId: "conv_1" };
    },
  });

  await Promise.resolve();
  abort.abort();
  release();
  await running;

  assert.equal(persistCalls, 0);
});

test("provider failure is not persisted and does not duplicate a done event", async () => {
  const emitted: AilaChatStreamEvent[] = [];
  let persistCalls = 0;

  await runStreamingChatSession({
    signal: new AbortController().signal,
    emit: (event) => {
      emitted.push(event);
    },
    generate: fromEvents([
      { type: "delta", content: "Hel" },
      { type: "error", error: "upstream 500 with secret" },
    ]),
    persist: async () => {
      persistCalls += 1;
      return { conversationId: "conv_1", sessionId: "conv_1" };
    },
  });

  assert.equal(persistCalls, 0);
  assert.equal(emitted.at(-1)?.type, "error");
  if (emitted[1]?.type === "error") {
    assert.equal(emitted[1].error.code, "EXTERNAL_SERVICE_ERROR");
    assert.equal(
      emitted[1].error.message,
      "Aila Intelligence could not respond right now."
    );
    assert.equal(emitted[1].error.message.includes("secret"), false);
  }
  assert.equal(
    emitted.filter((event) => event.type === "done").length,
    0
  );
});

test("new and existing conversations persist the same single reply payload", async () => {
  const persistArgs: string[] = [];

  await runStreamingChatSession({
    signal: new AbortController().signal,
    emit: () => {},
    generate: fromEvents([
      { type: "delta", content: "Hi" },
      { type: "done" },
    ]),
    persist: async (reply) => {
      persistArgs.push(reply);
      return { conversationId: "existing", sessionId: "existing" };
    },
  });

  await runStreamingChatSession({
    signal: new AbortController().signal,
    emit: () => {},
    generate: fromEvents([
      { type: "delta", content: "Hi" },
      { type: "done" },
    ]),
    persist: async (reply) => {
      persistArgs.push(reply);
      return { conversationId: "created", sessionId: "created" };
    },
  });

  assert.deepEqual(persistArgs, ["Hi", "Hi"]);
});

test("abort after provider completion still persists once and emits done", async () => {
  const abort = new AbortController();
  const emitted: AilaChatStreamEvent[] = [];
  let persistCalls = 0;

  await runStreamingChatSession({
    signal: abort.signal,
    emit: (event) => {
      emitted.push(event);
    },
    generate: (async function* () {
      yield { type: "delta" as const, content: "Hi" };
      yield { type: "done" as const };
      abort.abort();
    })(),
    persist: async (reply) => {
      persistCalls += 1;
      assert.equal(reply, "Hi");
      return { conversationId: "c1", sessionId: "c1" };
    },
  });

  assert.equal(persistCalls, 1);
  assert.equal(emitted.filter((event) => event.type === "done").length, 1);
});

test("abort during persist still emits a single done after the write", async () => {
  const abort = new AbortController();
  const emitted: AilaChatStreamEvent[] = [];
  let persistCalls = 0;

  await runStreamingChatSession({
    signal: abort.signal,
    emit: (event) => {
      emitted.push(event);
    },
    generate: fromEvents([
      { type: "delta", content: "Hi" },
      { type: "done" },
    ]),
    persist: async (reply) => {
      persistCalls += 1;
      abort.abort();
      assert.equal(reply, "Hi");
      return { conversationId: "c1", sessionId: "c1" };
    },
  });

  assert.equal(persistCalls, 1);
  assert.deepEqual(emitted.at(-1), {
    type: "done",
    conversationId: "c1",
    sessionId: "c1",
    reply: "Hi",
  });
});
