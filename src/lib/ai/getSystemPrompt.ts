import { SYSTEM_PROMPTS } from "./prompts";
import { AilaProduct } from "./types";

export function getSystemPrompt(
    product: AilaProduct = "intelligence"
) {
    return SYSTEM_PROMPTS[product];
}