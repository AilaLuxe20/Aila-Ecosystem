import { ValidationError } from "@/lib/errors/app-error";

export function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new ValidationError(
      {},
      { message: "The model did not return usable JSON." },
    );
  }

  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ValidationError(
        {},
        { message: "The model did not return a JSON object." },
      );
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      {},
      { message: "The model returned JSON that could not be parsed." },
    );
  }
}

export function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}
