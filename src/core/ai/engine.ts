/**
 * Single Aila AI Engine.
 *
 * Consolidates all chat and document analysis APIs into one engine.
 * Products specify only a mode (intelligence, legal, business, automation)
 * and the engine selects the appropriate system prompt and configuration.
 *
 * This replaces the previous duplicate implementations:
 * - /api/chat (intelligence)
 * - /api/legal-chat (legal)
 * - /api/business-chat (business)
 * - /api/automation-chat (automation)
 * - /api/legal-upload (document analysis)
 */

import type { ChatMessage, AilaMode } from "@/core/types";
import type { AIRequest, AIResponse, AIPromptConfig } from "@/core/ai/types";
import { PROMPTS, DOCUMENT_ANALYSIS_PROMPT } from "@/core/ai/prompts";
import { MODE_CONFIG, MAX_MESSAGES, MAX_MESSAGE_LENGTH, AI_MODEL } from "@/core/constants";
import { getOpenRouterApiKey } from "@/core/config";
import {
  saveDocument,
  getDocument,
  hasDocument,
  clearDocument,
} from "@/core/ai/documentContext";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Validate and sanitise chat messages.
 * Preserves the validation logic from all original API routes.
 */
function validateMessages(
  rawMessages: unknown[]
): ChatMessage[] {
  return rawMessages
    .filter(
      (message: unknown): message is ChatMessage => {
        if (typeof message !== "object" || message === null) {
          return false;
        }

        const candidate = message as Partial<ChatMessage>;

        return (
          (candidate.role === "user" ||
            candidate.role === "assistant") &&
          typeof candidate.content === "string" &&
          candidate.content.trim().length > 0
        );
      }
    )
    .slice(-MAX_MESSAGES)
    .map((message: ChatMessage): ChatMessage => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

/**
 * Get the prompt configuration for a given mode.
 */
function getPromptConfig(mode: AilaMode): AIPromptConfig {
  const modeConfig = MODE_CONFIG[mode];
  return {
    systemPrompt: PROMPTS[mode],
    maxTokens: modeConfig.maxTokens,
    temperature: modeConfig.temperature,
  };
}

/**
 * Send a chat request to the AI engine.
 *
 * @param request - The AI request containing mode, messages, and optional document context
 * @returns The AI response with reply or error
 */
export async function chat(request: AIRequest): Promise<AIResponse> {
  const { mode, messages, documentText, documentName } = request;

  // Check API key
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY");
    return {
      success: false,
      reply: "",
      error: "Aila Intelligence is not configured.",
    };
  }

  // Validate messages
  const validMessages = validateMessages(messages);

  if (validMessages.length === 0) {
    return {
      success: false,
      reply: "",
      error: "Please send Aila a message.",
    };
  }

  // Ensure last message is from user
  const lastMessage = validMessages[validMessages.length - 1];
  if (lastMessage.role !== "user") {
    return {
      success: false,
      reply: "",
      error: "The latest message must come from the user.",
    };
  }

  // Build the prompt configuration
  const promptConfig = getPromptConfig(mode);

  // If document text is provided, append it to the system prompt
  let systemPrompt = promptConfig.systemPrompt;

  if (documentText && documentText.trim().length > 0) {
    systemPrompt = `${promptConfig.systemPrompt}

DOCUMENT CONTEXT:

Document: ${documentName || "uploaded document"}

Content:
${documentText.trim().slice(0, 14000)}`;
  }

  // Call OpenRouter
  const aiResponse = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...validMessages,
      ],
      max_tokens: promptConfig.maxTokens,
      temperature: promptConfig.temperature,

    }),
  });

  const data = await aiResponse.json();

  if (!aiResponse.ok) {
    console.error("Aila AI Engine API Error:", data);

    const providerMessage =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "";

    return {
      success: false,
      reply: "",
      error: providerMessage || "Aila Intelligence could not respond right now.",
    };
  }

  const reply = data?.choices?.[0]?.message?.content;

  if (typeof reply !== "string" || !reply.trim()) {
    console.error("Aila AI Engine Empty Response:", data);

    return {
      success: false,
      reply: "",
      error: "Aila Intelligence did not receive a valid response.",
    };
  }

  return {
    success: true,
    reply: reply.trim(),
  };
}

/**
 * Analyze a document using the AI engine.
 *
 * This consolidates the document analysis logic from /api/legal-upload
 * and /products/ailalegal/analyze into a single pipeline.
 *
 * @param text - The extracted document text
 * @param fileName - The name of the uploaded file
 * @param mode - The AI mode to use for analysis (defaults to legal)
 * @returns The AI response with analysis or error
 */
export async function analyzeDocument(
  text: string,
  fileName: string,
  mode: AilaMode = "legal"
): Promise<AIResponse> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY");
    return {
      success: false,
      reply: "",
      error: "Aila Intelligence is not configured.",
    };
  }

  const documentText = text.trim().slice(0, 14000);

  if (!documentText) {
    return {
      success: false,
      reply: "",
      error: "No readable text found in the document.",
    };
  }

  const modeConfig = MODE_CONFIG[mode];

  const aiResponse = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: DOCUMENT_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: `
DOCUMENT NAME:
${fileName}

DOCUMENT CONTENT:
${documentText}
          `.trim(),
        },
      ],
      max_tokens: modeConfig.maxTokens,
      temperature: modeConfig.temperature,
    }),
  });

  const data = await aiResponse.json();

  if (!aiResponse.ok) {
    console.error("Aila Document Analysis API Error:", data);

    const providerMessage =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "";

    return {
      success: false,
      reply: "",
      error: providerMessage || "Aila could not analyze the document right now.",
    };
  }

  const analysis = data?.choices?.[0]?.message?.content;

  if (typeof analysis !== "string" || !analysis.trim()) {
    console.error("Aila Document Analysis Empty Response:", data);

    return {
      success: false,
      reply: "",
      error: "Aila completed the request but did not receive a valid analysis.",
    };
  }

  return {
    success: true,
    reply: analysis.trim(),
  };
}

/**
 * Get the current document context.
 * Delegates to the document context manager.
 */
export { getDocument, hasDocument, saveDocument, clearDocument };



