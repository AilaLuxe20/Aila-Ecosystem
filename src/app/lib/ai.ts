import "server-only";

/**
 * Aila AI Core
 * Shared AI client powering every product in the Aila Ecosystem
 * (Intelligence, AilaLegal, Business, Automation, Sites, Apps).
 *
 * Backed by OpenRouter so model choice can change per-product / per-task
 * without touching call sites.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ailaecosystem.com";
const OPENROUTER_APP_NAME = "Aila Ecosystem";

if (!OPENROUTER_API_KEY && process.env.NODE_ENV !== "test") {
  console.warn("[aila/ai] OPENROUTER_API_KEY is not set. AI calls will fail until it is configured.");
}

/** Central model registry — swap models here without touching product code. */
export const AI_MODELS = {
  default: "openai/gpt-4o-mini",
  reasoning: "openai/gpt-4o",
  legal: "openai/gpt-4o",
  vision: "openai/gpt-4o",
  fast: "meta-llama/llama-3.1-8b-instruct",
} as const;

export type AiModelKey = keyof typeof AI_MODELS;

/** Per-product identity — used to select system prompts and default models. */
export type AilaProduct =
  | "intelligence"
  | "legal"
  | "business"
  | "automation"
  | "sites"
  | "apps"
  | "core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatRole = "system" | "user" | "assistant";

export interface ImageContentPart {
  type: "image_url";
  image_url: { url: string };
}

export interface TextContentPart {
  type: "text";
  text: string;
}

export type MessageContent = string | Array<TextContentPart | ImageContentPart>;

export interface ChatMessage {
  role: ChatRole;
  content: MessageContent;
}

export interface AiChatOptions {
  product?: AilaProduct;
  modelKey?: AiModelKey;
  model?: string;
  messages: ChatMessage[];
  context?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface AiChatResult {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  raw: unknown;
}

export class AiError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = "AiError";
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// System prompts per product
// ---------------------------------------------------------------------------

const PRODUCT_SYSTEM_PROMPTS: Record<AilaProduct, string> = {
  core:
    "You are Aila, the shared AI core of the Aila Ecosystem. You are helpful, precise, and professional, and you are aware you may be operating inside any Aila product.",
  intelligence:
    "You are Aila Intelligence, a general enterprise AI workspace assistant. Help with conversations, documents, projects, tasks, and automation with a professional, concise tone.",
  legal:
    "You are AilaLegal, an enterprise legal intelligence assistant. You analyze contracts and legal documents, surface risk, extract clauses, and summarize documents clearly. You are not a substitute for a licensed attorney and should note this when giving substantive legal conclusions.",
  business:
    "You are Aila Business, an AI assistant for business owners. Help with business planning, strategy, financial planning, market research, competitor analysis, and business reports.",
  automation:
    "You are Aila Automation, an assistant for building business workflow automations, including email, CRM, and task automation.",
  sites:
    "You are Aila Sites, an AI website-generation assistant. Help plan and generate landing pages, company websites, and portfolios.",
  apps:
    "You are Aila Apps, an AI application-building assistant. Help design and generate web apps, dashboards, internal tools, and admin panels.",
};

function resolveModel(options: AiChatOptions): string {
  if (options.model) return options.model;
  if (options.modelKey) return AI_MODELS[options.modelKey];
  if (options.product === "legal") return AI_MODELS.legal;
  return AI_MODELS.default;
}

function buildMessages(options: AiChatOptions): ChatMessage[] {
  const product = options.product ?? "core";
  const systemPrompt = PRODUCT_SYSTEM_PROMPTS[product];

  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

  if (options.context) {
    messages.push({
      role: "system",
      content: `Relevant context for this conversation:\n\n${options.context}`,
    });
  }

  return [...messages, ...options.messages];
}

function authHeaders(): HeadersInit {
  if (!OPENROUTER_API_KEY) {
    throw new AiError("OPENROUTER_API_KEY is not configured on the server.");
  }

  return {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_SITE_URL,
    "X-Title": OPENROUTER_APP_NAME,
  };
}

// ---------------------------------------------------------------------------
// Non-streaming completion
// ---------------------------------------------------------------------------

export async function aiChat(options: AiChatOptions): Promise<AiChatResult> {
  const model = resolveModel(options);
  const messages = buildMessages(options);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: authHeaders(),
    signal: options.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await safeJson(response);
    throw new AiError(
      `OpenRouter request failed (${response.status})`,
      response.status,
      body,
    );
  }

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  return {
    content,
    model,
    usage: data?.usage,
    raw: data,
  };
}

// ---------------------------------------------------------------------------
// Streaming completion
// ---------------------------------------------------------------------------

export async function aiChatStream(
  options: AiChatOptions,
  onToken: (delta: string) => void,
): Promise<AiChatResult> {
  const model = resolveModel(options);
  const messages = buildMessages(options);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: authHeaders(),
    signal: options.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const body = await safeJson(response);
    throw new AiError(
      `OpenRouter stream request failed (${response.status})`,
      response.status,
      body,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta: string = parsed?.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          onToken(delta);
        }
      } catch {
        // Ignore malformed SSE chunks (keep-alive lines, partial frames).
      }
    }
  }

  return {
    content: fullText,
    model,
    raw: null,
  };
}

export function aiChatStreamResponse(options: AiChatOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await aiChatStream(options, (delta) => {
          controller.enqueue(encoder.encode(delta));
        });
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Vision helper
// ---------------------------------------------------------------------------

export async function aiAnalyzeImage(
  imageUrl: string,
  prompt: string,
  options: Omit<AiChatOptions, "messages"> = {},
): Promise<AiChatResult> {
  return aiChat({
    ...options,
    modelKey: options.modelKey ?? "vision",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}