import type { AIResponse } from "@/core/ai/types";
import type { RoutingResult } from "../router/router";

export interface ResponseContext {
  routing: RoutingResult;
  reply: string;
}

export function buildResponse(
  context: ResponseContext
): AIResponse {
  return {
    success: true,
    reply: context.reply.trim(),
  };
}

export function buildErrorResponse(
  message: string
): AIResponse {
  return {
    success: false,
    reply: "",
    error: message,
  };
}
