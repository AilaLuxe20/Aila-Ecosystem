import assert from "node:assert/strict";
import { test } from "node:test";

import { buildOpenRouterModelQueue } from "./index";
import {
  DEFAULT_OPENROUTER_CHAT_MODEL,
  DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL,
  DEFAULT_OPENROUTER_VISION_MODEL,
} from "@/core/constants";

test("default OpenRouter ids match the production free stack", () => {
  assert.equal(DEFAULT_OPENROUTER_CHAT_MODEL, "z-ai/glm-5.2:free");
  assert.equal(
    DEFAULT_OPENROUTER_VISION_MODEL,
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  );
  assert.equal(DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL, "google/gemma-4-31b-it:free");
});

test("text and document queues prefer GLM then Gemma", () => {
  const queue = {
    chatModel: DEFAULT_OPENROUTER_CHAT_MODEL,
    visionModel: DEFAULT_OPENROUTER_VISION_MODEL,
    fallbacks: [DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL],
  };

  assert.deepEqual(buildOpenRouterModelQueue({ kind: "chat", ...queue }), [
    DEFAULT_OPENROUTER_CHAT_MODEL,
    DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL,
  ]);
  assert.deepEqual(buildOpenRouterModelQueue({ kind: "document", ...queue }), [
    DEFAULT_OPENROUTER_CHAT_MODEL,
    DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL,
  ]);
});

test("vision queue prefers Nemotron Omni then Gemma", () => {
  assert.deepEqual(
    buildOpenRouterModelQueue({
      kind: "vision",
      chatModel: DEFAULT_OPENROUTER_CHAT_MODEL,
      visionModel: DEFAULT_OPENROUTER_VISION_MODEL,
      fallbacks: [DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL],
    }),
    [DEFAULT_OPENROUTER_VISION_MODEL, DEFAULT_OPENROUTER_DOCUMENT_FALLBACK_MODEL],
  );
});
