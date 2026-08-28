import { z } from "zod";

import type { AilaMode } from "@/core/types";
import type { ErrorCode } from "@/lib/errors/app-error";

export const INTELLIGENCE_TOOL_NAMES = [
  "web_research",
  "analyze_text",
  "analyze_data",
  "calculator",
] as const;

export type IntelligenceToolName = (typeof INTELLIGENCE_TOOL_NAMES)[number];

export type ToolAuthRequirement = "authenticated";

export type ToolContext = {
  userId: string;
  mode: AilaMode;
  documentText?: string;
  documentName?: string;
  documentKind?: string;
};

export type ToolErrorResult = {
  ok: false;
  error: {
    code: ErrorCode | "UNKNOWN_TOOL" | "TOOL_FAILED";
    message: string;
  };
};

export type ToolSuccessResult<T> = {
  ok: true;
  data: T;
};

export type ToolResult<T> = ToolSuccessResult<T> | ToolErrorResult;

export type OpenRouterToolSpec = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type IntelligenceTool<TSchema extends z.ZodType, TData> = {
  name: IntelligenceToolName;
  description: string;
  auth: ToolAuthRequirement;
  allowedModes: readonly AilaMode[];
  inputSchema: TSchema;
  parameters: Record<string, unknown>;
  execute: (
    input: z.infer<TSchema>,
    context: ToolContext
  ) => Promise<ToolResult<TData>>;
};

export type ProviderChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

export function isIntelligenceToolName(
  value: string
): value is IntelligenceToolName {
  return (INTELLIGENCE_TOOL_NAMES as readonly string[]).includes(value);
}

export function toolsEnabledForMode(mode: AilaMode): boolean {
  return mode === "intelligence";
}
