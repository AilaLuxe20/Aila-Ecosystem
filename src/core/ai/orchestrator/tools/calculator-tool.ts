import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors/app-error";

import type { IntelligenceTool, ToolResult } from "./contract";
import { evaluateExpression } from "./calculator";

export const calculatorInputSchema = z
  .object({
    expression: z.string().trim().min(1).max(200),
  })
  .strict();

export type CalculatorData = {
  expression: string;
  value: number;
};

export const calculatorTool: IntelligenceTool<
  typeof calculatorInputSchema,
  CalculatorData
> = {
  name: "calculator",
  description:
    "Evaluate a numeric expression. Supports + - * / % ^, parentheses, pi, e, abs, sqrt, round, floor, ceil, min, and max.",
  auth: "authenticated",
  allowedModes: ["intelligence"],
  inputSchema: calculatorInputSchema,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      expression: {
        type: "string",
        description: "Arithmetic expression, for example 12.5 * (3 + 1).",
      },
    },
    required: ["expression"],
  },
  async execute(input): Promise<ToolResult<CalculatorData>> {
    const outcome = evaluateExpression(input.expression);

    if (!outcome.ok) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: outcome.message,
        },
      };
    }

    return {
      ok: true,
      data: {
        expression: input.expression,
        value: outcome.value,
      },
    };
  },
};
