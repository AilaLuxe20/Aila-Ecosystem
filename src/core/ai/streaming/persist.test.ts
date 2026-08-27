import assert from "node:assert/strict";
import { test } from "node:test";

import { decideStreamPersistence } from "./persist";

test("persists a completed non-empty reply once", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: false,
      streamCompleted: true,
      accumulated: "  Hello  ",
    }),
    { persist: true, reply: "Hello" }
  );
});

test("persists a short but meaningful reply", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: false,
      streamCompleted: true,
      accumulated: "OK",
    }),
    { persist: true, reply: "OK" }
  );
});

test("does not persist an empty completed stream", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: false,
      streamCompleted: true,
      accumulated: "   ",
    }),
    { persist: false, reason: "empty" }
  );
});

test("does not persist a cancelled partial stream", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: true,
      providerError: false,
      streamCompleted: false,
      accumulated: "partial reply",
    }),
    { persist: false, reason: "aborted" }
  );
});

test("does not persist a provider failure", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: true,
      streamCompleted: false,
      accumulated: "Hel",
    }),
    { persist: false, reason: "provider_error" }
  );
});

test("does not persist an incomplete stream", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: false,
      streamCompleted: false,
      accumulated: "Hello",
    }),
    { persist: false, reason: "incomplete" }
  );
});

test("persists a completed reply even if the client aborted after [DONE]", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: true,
      providerError: false,
      streamCompleted: true,
      accumulated: "Hello",
    }),
    { persist: true, reply: "Hello" }
  );
});
