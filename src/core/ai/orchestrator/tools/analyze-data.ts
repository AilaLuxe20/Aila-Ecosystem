import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors/app-error";

import type { IntelligenceTool, ToolResult } from "./contract";

export const analyzeDataInputSchema = z
  .object({
    format: z.enum(["json", "csv"]).optional(),
    data: z.string().trim().min(1).max(14000).optional(),
  })
  .strict();

export type AnalyzeDataData = {
  format: "json" | "csv";
  rows: number;
  columns: string[];
  numeric: Record<string, { count: number; min: number; max: number }>;
  sample: Record<string, string>[];
};

function summarizeRows(rows: Record<string, string>[]): AnalyzeDataData["numeric"] {
  const numeric: AnalyzeDataData["numeric"] = {};
  const columns = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columns.add(key);
    }
  }

  for (const column of columns) {
    const values: number[] = [];
    for (const row of rows) {
      const raw = row[column]?.trim() ?? "";
      if (!raw) {
        continue;
      }
      const value = Number(raw);
      if (Number.isFinite(value) && /^-?\d+(\.\d+)?$/.test(raw)) {
        values.push(value);
      }
    }
    if (values.length > 0) {
      numeric[column] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }
  }

  return numeric;
}

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(",").map((cell) => cell.trim() || "column");
  const rows: Record<string, string>[] = [];

  for (const line of lines.slice(1, 201)) {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseJson(raw: string): Record<string, string>[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const records = Array.isArray(parsed) ? parsed : [parsed];
  const rows: Record<string, string>[] = [];

  for (const item of records.slice(0, 200)) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row: Record<string, string> = {};
    for (const [key, value] of Object.entries(item)) {
      if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        row[key] = String(value);
      }
    }
    rows.push(row);
  }

  return rows;
}

export const analyzeDataTool: IntelligenceTool<
  typeof analyzeDataInputSchema,
  AnalyzeDataData
> = {
  name: "analyze_data",
  description:
    "Summarize JSON or CSV-like structured data. Optional when a CSV or JSON file is already attached to the request.",
  auth: "authenticated",
  allowedModes: ["intelligence"],
  inputSchema: analyzeDataInputSchema,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      format: {
        type: "string",
        enum: ["json", "csv"],
      },
      data: {
        type: "string",
        description: "Raw JSON or CSV text. Optional when structured data is already attached.",
      },
    },
  },
  async execute(input, context): Promise<ToolResult<AnalyzeDataData>> {
    const format =
      input.format ??
      (context.documentKind === "csv" || context.documentKind === "json"
        ? context.documentKind
        : undefined);
    const data = (input.data ?? (format === context.documentKind ? context.documentText : undefined) ?? "").trim();

    if (!format || !data) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "No structured data was provided to analyze.",
        },
      };
    }

    const rows =
      format === "csv" ? parseCsv(data) : parseJson(data);

    if (rows === null) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "Structured data could not be parsed.",
        },
      };
    }

    if (rows.length === 0) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "Structured data did not contain any rows.",
        },
      };
    }

    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];

    return {
      ok: true,
      data: {
        format,
        rows: rows.length,
        columns,
        numeric: summarizeRows(rows),
        sample: rows.slice(0, 5),
      },
    };
  },
};
