/**
 * OpenRouter (OpenAI-compatible) SSE parsing and Aila chat stream encoding.
 *
 * This is a real protocol parser: it reads `data:` lines from the provider
 * stream. It does not split a completed reply into fake tokens.
 */

export type OpenRouterStreamEvent =
  | { type: "delta"; content: string }
  | { type: "done" };

export type AilaChatStreamEvent =
  | { type: "delta"; content: string }
  | {
      type: "done";
      conversationId: string;
      sessionId: string;
      reply: string;
    }
  | {
      type: "error";
      error: { code: string; message: string };
    };

export function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function encodeSseData(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function splitSseLines(buffer: string): {
  lines: string[];
  rest: string;
} {
  const normalized = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = normalized.split("\n");
  const rest = parts.pop() ?? "";
  return { lines: parts, rest };
}

function extractOpenRouterDeltaContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const choices = (payload as { choices?: unknown }).choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    return "";
  }

  const first = choices[0];

  if (!first || typeof first !== "object") {
    return "";
  }

  const delta = (first as { delta?: unknown }).delta;

  if (!delta || typeof delta !== "object") {
    return "";
  }

  const content = (delta as { content?: unknown }).content;

  return typeof content === "string" ? content : "";
}

export function parseOpenRouterSseLine(
  line: string
): OpenRouterStreamEvent | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith(":")) {
    return null;
  }

  if (!trimmed.startsWith("data:")) {
    return null;
  }

  const data = trimmed.slice("data:".length).trim();

  if (!data) {
    return null;
  }

  if (data === "[DONE]") {
    return { type: "done" };
  }

  try {
    const payload: unknown = JSON.parse(data);
    const content = extractOpenRouterDeltaContent(payload);
    return content ? { type: "delta", content } : null;
  } catch {
    return null;
  }
}

export function parseAilaSseData(data: string): AilaChatStreamEvent | null {
  try {
    const payload: unknown = JSON.parse(data);

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const type = (payload as { type?: unknown }).type;

    if (type === "delta") {
      const content = (payload as { content?: unknown }).content;
      return typeof content === "string"
        ? { type: "delta", content }
        : null;
    }

    if (type === "done") {
      const conversationId = (payload as { conversationId?: unknown })
        .conversationId;
      const sessionId = (payload as { sessionId?: unknown }).sessionId;
      const reply = (payload as { reply?: unknown }).reply;

      if (
        typeof conversationId !== "string" ||
        typeof sessionId !== "string" ||
        typeof reply !== "string"
      ) {
        return null;
      }

      return { type: "done", conversationId, sessionId, reply };
    }

    if (type === "error") {
      const error = (payload as { error?: unknown }).error;

      if (!error || typeof error !== "object") {
        return null;
      }

      const code = (error as { code?: unknown }).code;
      const message = (error as { message?: unknown }).message;

      if (typeof code !== "string" || typeof message !== "string") {
        return null;
      }

      return { type: "error", error: { code, message } };
    }

    return null;
  } catch {
    return null;
  }
}

export function parseAilaSseBlock(block: string): AilaChatStreamEvent | null {
  const lines = block.replace(/\r\n/g, "\n").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("data:")) {
      continue;
    }

    return parseAilaSseData(trimmed.slice("data:".length).trim());
  }

  return null;
}

export function splitSseBlocks(buffer: string): {
  blocks: string[];
  rest: string;
} {
  const normalized = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = normalized.split("\n\n");
  const rest = parts.pop() ?? "";
  return {
    blocks: parts.filter((block) => block.trim().length > 0),
    rest,
  };
}

function bindAbortToReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal?: AbortSignal
): () => void {
  if (!signal) {
    return () => {};
  }

  const onAbort = () => {
    void reader.cancel().catch(() => {
      // Already closed or cancelled.
    });
  };

  if (signal.aborted) {
    onAbort();
    return () => {};
  }

  signal.addEventListener("abort", onAbort);
  return () => signal.removeEventListener("abort", onAbort);
}

export async function* iterateOpenRouterSse(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<OpenRouterStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const detachAbort = bindAbortToReader(reader, signal);
  let buffer = "";
  let completed = false;

  try {
    while (!completed) {
      if (signal?.aborted) {
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        break;
      }

      if (!value || value.byteLength === 0) {
        continue;
      }

      buffer += decoder.decode(value, { stream: true });
      const { lines, rest } = splitSseLines(buffer);
      buffer = rest;

      for (const line of lines) {
        const event = parseOpenRouterSseLine(line);

        if (!event) {
          continue;
        }

        yield event;

        if (event.type === "done") {
          completed = true;
          break;
        }
      }
    }

    if (!completed && buffer.trim() && !signal?.aborted) {
      const { lines, rest } = splitSseLines(buffer);
      buffer = rest;

      for (const line of [...lines, rest]) {
        const event = parseOpenRouterSseLine(line);

        if (!event) {
          continue;
        }

        yield event;

        if (event.type === "done") {
          break;
        }
      }
    }
  } finally {
    detachAbort();
    try {
      reader.releaseLock();
    } catch {
      // Reader may already be released after abort.
    }
  }
}

export async function* iterateAilaSse(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<AilaChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const detachAbort = bindAbortToReader(reader, signal);
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        break;
      }

      if (!value || value.byteLength === 0) {
        continue;
      }

      buffer += decoder.decode(value, { stream: true });
      const { blocks, rest } = splitSseBlocks(buffer);
      buffer = rest;

      for (const block of blocks) {
        const event = parseAilaSseBlock(block);

        if (event) {
          yield event;
        }
      }
    }

    if (buffer.trim() && !signal?.aborted) {
      const { blocks, rest } = splitSseBlocks(buffer);

      for (const block of [...blocks, rest]) {
        const event = parseAilaSseBlock(block);

        if (event) {
          yield event;
        }
      }
    }
  } finally {
    detachAbort();
    try {
      reader.releaseLock();
    } catch {
      // Reader may already be released after abort.
    }
  }
}
