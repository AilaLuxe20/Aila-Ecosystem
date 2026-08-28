import { MAX_TOOL_ITERATIONS } from "@/core/constants";
import type { AIRequest } from "@/core/ai/types";
import {
  toolsEnabledForMode,
  type OpenRouterToolSpec,
  type ProviderChatMessage,
  type ToolContext,
} from "./contract";
import {
  parseToolArguments,
  runRegisteredTool,
  serializeToolResult,
  toOpenRouterToolSpecs,
} from "./execute";

export type ChatTurnResult = {
  success: boolean;
  reply: string;
  toolCalls: Array<{ id: string; name: string; arguments: string }>;
  error?: string;
};

export type ToolLoopResult =
  | { status: "reply"; reply: string; toolRounds: number }
  | {
      status: "continue_stream";
      providerMessages: ProviderChatMessage[];
      toolRounds: number;
    }
  | { status: "error"; error: string };

const TOOL_SYSTEM_NOTE = `You may call tools when they materially improve the answer.
Use calculator for arithmetic. Use analyze_text for attached PDF, text, or markdown. Use analyze_data for attached CSV or JSON. Use web_research only for current external facts.
If a document is already attached, do not ask the user to paste it again. If a tool reports it is unavailable or misconfigured, say so. Do not invent tool results.`;

export function buildToolContext(request: AIRequest): ToolContext | null {
  if (!request.userId) {
    return null;
  }

  return {
    userId: request.userId,
    mode: request.mode,
    documentText: request.documentToolText ?? request.documentText,
    documentName: request.documentName,
    documentKind: request.documentKind,
  };
}

export async function runIntelligenceToolLoop(options: {
  request: AIRequest;
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
  maxIterations?: number;
  completeTurn: (args: {
    request: AIRequest;
    providerMessages: ProviderChatMessage[];
    tools: OpenRouterToolSpec[];
    signal?: AbortSignal;
  }) => Promise<ChatTurnResult>;
}): Promise<ToolLoopResult> {
  if (!toolsEnabledForMode(options.request.mode)) {
    return { status: "error", error: "Tools are not enabled for this workspace." };
  }

  const context = buildToolContext(options.request);
  if (!context) {
    return { status: "error", error: "Authentication required." };
  }

  const maxIterations = options.maxIterations ?? MAX_TOOL_ITERATIONS;
  const tools = toOpenRouterToolSpecs();
  const providerMessages: ProviderChatMessage[] = [
    {
      role: "system",
      content: `${options.systemPrompt}\n\n${TOOL_SYSTEM_NOTE}`,
    },
    ...options.history,
  ];

  let toolRounds = 0;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    if (options.signal?.aborted) {
      return { status: "error", error: "aborted" };
    }

    const turn = await options.completeTurn({
      request: options.request,
      providerMessages,
      tools,
      signal: options.signal,
    });

    if (!turn.success) {
      return {
        status: "error",
        error: turn.error ?? "Aila Intelligence could not respond right now.",
      };
    }

    if (turn.toolCalls.length === 0) {
      if (!turn.reply.trim()) {
        return {
          status: "error",
          error: "Aila Intelligence could not respond right now.",
        };
      }

      return {
        status: "reply",
        reply: turn.reply.trim(),
        toolRounds,
      };
    }

    providerMessages.push({
      role: "assistant",
      content: turn.reply.trim() ? turn.reply : null,
      tool_calls: turn.toolCalls.map((call) => ({
        id: call.id,
        type: "function",
        function: { name: call.name, arguments: call.arguments },
      })),
    });

    for (const call of turn.toolCalls) {
      const args = parseToolArguments(call.arguments);
      const result = await runRegisteredTool(call.name, args, context);
      providerMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: serializeToolResult(result),
      });
    }

    toolRounds += 1;
  }

  return {
    status: "continue_stream",
    providerMessages,
    toolRounds,
  };
}
