import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_TOOL_ITERATIONS } from "@/core/constants";
import { evaluateExpression } from "./calculator";
import { toolsEnabledForMode } from "./contract";
import { runRegisteredTool } from "./execute";
import { runIntelligenceToolLoop } from "./loop";
import {
  getRegisteredTool,
  listRegisteredTools,
} from "./registry";

const auth = {
  userId: "user_1",
  mode: "intelligence" as const,
};

test("tool registry exposes the allowlisted Intelligence tools", () => {
  const names = listRegisteredTools().map((tool) => tool.name).sort();
  assert.deepEqual(names, [
    "analyze_data",
    "analyze_text",
    "calculator",
    "web_research",
  ]);
  assert.ok(getRegisteredTool("calculator"));
  assert.equal(getRegisteredTool("shell"), undefined);
});

test("valid tool arguments execute", async () => {
  const result = await runRegisteredTool(
    "calculator",
    { expression: "2 + 2 * 3" },
    auth
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    const data = result.data as { value: number };
    assert.equal(data.value, 8);
  }
});

test("invalid tool arguments are rejected", async () => {
  const result = await runRegisteredTool(
    "calculator",
    { expression: 12 },
    auth
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "VALIDATION_FAILED");
  }
});

test("unauthorized tool execution is rejected", async () => {
  const unauthenticated = await runRegisteredTool(
    "calculator",
    { expression: "1+1" },
    { userId: "", mode: "intelligence" }
  );
  assert.equal(unauthenticated.ok, false);
  if (!unauthenticated.ok) {
    assert.equal(unauthenticated.error.code, "UNAUTHENTICATED");
  }

  const wrongMode = await runRegisteredTool(
    "calculator",
    { expression: "1+1" },
    { userId: "user_1", mode: "legal" }
  );
  assert.equal(wrongMode.ok, false);
  if (!wrongMode.ok) {
    assert.equal(wrongMode.error.code, "FORBIDDEN");
  }
});

test("unknown tool is rejected", async () => {
  const result = await runRegisteredTool("rm_rf", { path: "/" }, auth);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "UNKNOWN_TOOL");
  }
});

test("calculator evaluates deterministic expressions", () => {
  assert.deepEqual(evaluateExpression("12.5 * (3 + 1)"), {
    ok: true,
    value: 50,
  });
  assert.equal(evaluateExpression("sqrt(9)").ok, true);
  assert.equal(evaluateExpression("min(3, 8, 2)").ok, true);
});

test("malformed calculator input is rejected", () => {
  assert.equal(evaluateExpression("").ok, false);
  assert.equal(evaluateExpression("2+").ok, false);
  assert.equal(evaluateExpression("process.exit()").ok, false);
  assert.equal(evaluateExpression("2;3").ok, false);
  const zero = evaluateExpression("1/0");
  assert.equal(zero.ok, false);
});

test("analyze_data succeeds for JSON rows", async () => {
  const result = await runRegisteredTool(
    "analyze_data",
    {
      format: "json",
      data: JSON.stringify([
        { sku: "A", price: 10 },
        { sku: "B", price: 30 },
      ]),
    },
    auth
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    const data = result.data as {
      rows: number;
      numeric: { price?: { min: number; max: number } };
    };
    assert.equal(data.rows, 2);
    assert.equal(data.numeric.price?.min, 10);
    assert.equal(data.numeric.price?.max, 30);
  }
});

test("tool failure returns a safe error", async () => {
  const result = await runRegisteredTool(
    "analyze_data",
    { format: "json", data: "{not-json" },
    auth
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "VALIDATION_FAILED");
    assert.equal(result.error.message.includes("{not-json"), false);
  }
});

test("maximum tool iterations stops the loop", async () => {
  let turns = 0;
  const result = await runIntelligenceToolLoop({
    request: {
      mode: "intelligence",
      messages: [{ role: "user", content: "loop" }],
      userId: "user_1",
    },
    systemPrompt: "test",
    history: [{ role: "user", content: "loop" }],
    maxIterations: MAX_TOOL_ITERATIONS,
    completeTurn: async () => {
      turns += 1;
      return {
        success: true,
        reply: "",
        toolCalls: [
          {
            id: `call_${turns}`,
            name: "calculator",
            arguments: JSON.stringify({ expression: "1+1" }),
          },
        ],
      };
    },
  });

  assert.equal(result.status, "continue_stream");
  assert.equal(turns, MAX_TOOL_ITERATIONS);
  if (result.status === "continue_stream") {
    assert.equal(result.toolRounds, MAX_TOOL_ITERATIONS);
  }
});

test("model requesting unavailable web research does not invent results", async () => {
  const result = await runRegisteredTool(
    "web_research",
    { query: "current weather" },
    auth
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "CONFIGURATION_ERROR");
  }
});

test("tools are intelligence-only and require an authenticated user id", () => {
  assert.equal(toolsEnabledForMode("intelligence"), true);
  assert.equal(toolsEnabledForMode("legal"), false);
  assert.equal(toolsEnabledForMode("business"), false);
});

test("conversation writes are not part of tool execution", async () => {
  const result = await runRegisteredTool(
    "analyze_text",
    { text: "Hello world. Hello again." },
    auth
  );
  assert.equal(result.ok, true);
  assert.equal("conversationId" in result, false);
});

test("rate limiting remains on the chat API, not the tool runner", async () => {
  const { aiChatRateLimiter } = await import("@/core/ai/chat-api");
  assert.equal(typeof aiChatRateLimiter.check, "function");
});

test("streaming final response still works after a completed tool loop", async () => {
  const result = await runIntelligenceToolLoop({
    request: {
      mode: "intelligence",
      messages: [{ role: "user", content: "2+2" }],
      userId: "user_1",
    },
    systemPrompt: "test",
    history: [{ role: "user", content: "2+2" }],
    completeTurn: async () => ({
      success: true,
      reply: "4",
      toolCalls: [],
    }),
  });

  assert.deepEqual(result, {
    status: "reply",
    reply: "4",
    toolRounds: 0,
  });
});

test("tool loop does not persist messages", async () => {
  const result = await runIntelligenceToolLoop({
    request: {
      mode: "intelligence",
      messages: [{ role: "user", content: "hi" }],
      userId: "user_1",
    },
    systemPrompt: "test",
    history: [{ role: "user", content: "hi" }],
    completeTurn: async () => ({
      success: true,
      reply: "hello",
      toolCalls: [],
    }),
  });

  assert.equal(result.status, "reply");
  assert.equal("persist" in result, false);
  assert.equal("conversationId" in result, false);
});
