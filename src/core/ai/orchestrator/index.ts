import type { AIRequest, AIResponse } from "@/core/ai/types";
import { chat } from "@/core/ai/engine";

export async function orchestrate(
  request: AIRequest
): Promise<AIResponse> {
  return chat(request);
}
