export const INTELLIGENCE_FILE_KINDS = [
  "pdf",
  "txt",
  "csv",
  "json",
  "markdown",
  "image",
  "audio",
] as const;

export type IntelligenceFileKind = (typeof INTELLIGENCE_FILE_KINDS)[number];

export const INTELLIGENCE_KIND_MIME: Record<IntelligenceFileKind, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  markdown: "text/markdown",
  image: "image/jpeg",
  audio: "audio/webm",
};

export function isIntelligenceFileKind(
  value: string
): value is IntelligenceFileKind {
  return (INTELLIGENCE_FILE_KINDS as readonly string[]).includes(value);
}

export function extensionToKind(extension: string): IntelligenceFileKind | null {
  switch (extension) {
    case "pdf":
      return "pdf";
    case "txt":
      return "txt";
    case "csv":
      return "csv";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
    case "gif":
      return "image";
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
    case "webm":
      return "audio";
    default:
      return null;
  }
}

export const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "m4v"] as const;

export function isRejectedVideoExtension(extension: string): boolean {
  return (VIDEO_EXTENSIONS as readonly string[]).includes(extension);
}
