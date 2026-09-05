import type { AilaMode } from "@/core/types";

export const CHAT_ATTACHMENT_MODES = [
  "intelligence",
  "writer",
  "legal",
  "business",
  "automation",
] as const satisfies readonly AilaMode[];

export function modeAllowsChatAttachments(mode: AilaMode): boolean {
  return (CHAT_ATTACHMENT_MODES as readonly string[]).includes(mode);
}

export const CHAT_ATTACHMENT_ACCEPT =
  ".pdf,.txt,.csv,.json,.md,.markdown,.png,.jpg,.jpeg,.webp,.gif,.mp3,.wav,.ogg,.m4a,.webm,.mp4,.mov,.m4v,image/*,audio/*,video/*,image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm,video/mp4,video/quicktime";
