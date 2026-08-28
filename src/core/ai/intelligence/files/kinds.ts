export const INTELLIGENCE_FILE_KINDS = [
  "pdf",
  "txt",
  "csv",
  "json",
  "markdown",
] as const;

export type IntelligenceFileKind = (typeof INTELLIGENCE_FILE_KINDS)[number];

export const INTELLIGENCE_KIND_MIME: Record<IntelligenceFileKind, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  markdown: "text/markdown",
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
    default:
      return null;
  }
}
