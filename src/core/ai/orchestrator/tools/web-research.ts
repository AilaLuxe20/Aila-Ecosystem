import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors/app-error";

import type { IntelligenceTool, ToolResult } from "./contract";

export const webResearchInputSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
  })
  .strict();

export type WebResearchData = {
  available: false;
  query: string;
  reason: string;
};

/**
 * No web/search provider is wired in this application.
 * Do not invent results. Callers must treat this as unavailable.
 */
export function isWebResearchConfigured(): boolean {
  return false;
}

export const webResearchTool: IntelligenceTool<
  typeof webResearchInputSchema,
  WebResearchData
> = {
  name: "web_research",
  description:
    "Look up current external information. Returns a configuration error when no web provider is available.",
  auth: "authenticated",
  allowedModes: ["intelligence"],
  inputSchema: webResearchInputSchema,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      query: {
        type: "string",
        description: "The search question or topic.",
      },
    },
    required: ["query"],
  },
  async execute(input): Promise<ToolResult<WebResearchData>> {
    if (!isWebResearchConfigured()) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.CONFIGURATION_ERROR,
          message:
            "Web research is not configured. Aila cannot look up live web results until a search provider is added.",
        },
      };
    }

    return {
      ok: true,
      data: {
        available: false,
        query: input.query,
        reason: "Web research is not configured.",
      },
    };
  },
};
