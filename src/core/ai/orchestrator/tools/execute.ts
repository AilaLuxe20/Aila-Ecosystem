import { createLogger } from "@/lib/logger/logger";
import { ERROR_CODES } from "@/lib/errors/app-error";

import {
  type OpenRouterToolSpec,
  type ToolContext,
  type ToolResult,
} from "./contract";
import { getRegisteredTool, listRegisteredTools } from "./registry";

const log = createLogger("ai.tools");

const MAX_RESULT_CHARS = 8000;

export function toOpenRouterToolSpecs(): OpenRouterToolSpec[] {
  return listRegisteredTools().map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export async function runRegisteredTool(
  name: string,
  rawInput: unknown,
  context: ToolContext
): Promise<ToolResult<unknown>> {
  const started = Date.now();

  const finish = (
    result: ToolResult<unknown>,
    toolName: string
  ): ToolResult<unknown> => {
    log.info("tool execution", {
      tool: toolName,
      ok: result.ok,
      durationMs: Date.now() - started,
      code: result.ok ? "OK" : result.error.code,
    });
    return result;
  };

  if (!context.userId) {
    return finish(
      {
        ok: false,
        error: {
          code: ERROR_CODES.UNAUTHENTICATED,
          message: "Authentication required.",
        },
      },
      name || "unknown"
    );
  }

  const tool = getRegisteredTool(name);

  if (!tool) {
    return finish(
      {
        ok: false,
        error: {
          code: "UNKNOWN_TOOL",
          message: "That tool is not available.",
        },
      },
      name || "unknown"
    );
  }

  if (!tool.allowedModes.includes(context.mode)) {
    return finish(
      {
        ok: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: "That tool is not available in this workspace.",
        },
      },
      name
    );
  }

  const parsed = tool.inputSchema.safeParse(rawInput);

  if (!parsed.success) {
    return finish(
      {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "Invalid tool arguments.",
        },
      },
      name
    );
  }

  try {
    const result = await tool.execute(parsed.data as never, context);
    return finish(result, name);
  } catch {
    return finish(
      {
        ok: false,
        error: {
          code: "TOOL_FAILED",
          message: "The tool could not complete.",
        },
      },
      name
    );
  }
}

export function serializeToolResult(result: ToolResult<unknown>): string {
  const payload = JSON.stringify(result);
  if (payload.length <= MAX_RESULT_CHARS) {
    return payload;
  }
  return JSON.stringify({
    ok: false,
    error: {
      code: "TOOL_FAILED",
      message: "Tool result was too large to return.",
    },
  });
}

export function parseToolArguments(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
