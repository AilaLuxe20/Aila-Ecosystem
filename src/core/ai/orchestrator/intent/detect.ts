export type AilaIntent =
  | "chat"
  | "document"
  | "legal"
  | "business"
  | "automation"
  | "planning";

export function detectIntent(message: string): AilaIntent {
  const text = message.toLowerCase();

  if (
    text.includes("contract") ||
    text.includes("agreement") ||
    text.includes("law") ||
    text.includes("legal")
  ) {
    return "legal";
  }

  if (
    text.includes("document") ||
    text.includes("pdf") ||
    text.includes("upload")
  ) {
    return "document";
  }

  if (
    text.includes("business") ||
    text.includes("company") ||
    text.includes("startup")
  ) {
    return "business";
  }

  if (
    text.includes("workflow") ||
    text.includes("automation") ||
    text.includes("automate")
  ) {
    return "automation";
  }

  if (
    text.includes("plan") ||
    text.includes("roadmap") ||
    text.includes("architecture") ||
    text.includes("build")
  ) {
    return "planning";
  }

  return "chat";
}
