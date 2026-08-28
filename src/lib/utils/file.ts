import { formatBytes } from "./format";

/** Broad classification of a file, used to pick icons and preview behaviour. */
export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "code"
  | "unknown";

/** Outcome of validating a file against upload constraints. */
export interface FileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** Constraints applied to an uploaded file. */
export interface FileConstraints {
  /** Maximum size in bytes. */
  readonly maxSize?: number;
  /** Accepted MIME types. Supports wildcards such as `image/*`. */
  readonly accept?: readonly string[];
}

const EXTENSION_KINDS: ReadonlyArray<readonly [FileKind, readonly string[]]> = [
  ["image", ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico"]],
  ["video", ["mp4", "webm", "mov", "avi", "mkv", "m4v"]],
  ["audio", ["mp3", "wav", "ogg", "flac", "m4a", "aac"]],
  ["document", ["pdf", "doc", "docx", "txt", "md", "rtf", "odt"]],
  ["spreadsheet", ["xls", "xlsx", "csv", "ods"]],
  ["presentation", ["ppt", "pptx", "odp", "key"]],
  ["archive", ["zip", "rar", "7z", "tar", "gz", "bz2"]],
  ["code", ["ts", "tsx", "js", "jsx", "json", "html", "css", "py", "go", "rs", "java", "sql"]],
];

/**
 * Extracts the lowercase extension from a file name.
 *
 * @param fileName - Name including extension.
 * @returns The extension without a leading dot, or an empty string when absent.
 */
export function getFileExtension(fileName: string): string {
  const separatorIndex = fileName.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === fileName.length - 1) return "";
  return fileName.slice(separatorIndex + 1).toLowerCase();
}

/**
 * Returns a file name without its extension.
 *
 * @param fileName - Name including extension.
 * @returns The base name.
 */
export function getFileBaseName(fileName: string): string {
  const separatorIndex = fileName.lastIndexOf(".");
  return separatorIndex <= 0 ? fileName : fileName.slice(0, separatorIndex);
}

/**
 * Classifies a file from its name and optional MIME type.
 *
 * @param fileName - Name including extension.
 * @param mimeType - Optional MIME type, which takes priority when recognised.
 * @returns The file's broad classification.
 */
export function getFileKind(fileName: string, mimeType?: string): FileKind {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "document";
  }

  const extension = getFileExtension(fileName);
  if (extension.length === 0) return "unknown";

  for (const [kind, extensions] of EXTENSION_KINDS) {
    if (extensions.includes(extension)) return kind;
  }

  return "unknown";
}

/**
 * Tests a MIME type against an accept pattern such as `image/*` or `.pdf`.
 *
 * @param mimeType - The file's MIME type.
 * @param fileName - The file's name, used for extension patterns.
 * @param pattern - A single accept pattern.
 * @returns True when the file satisfies the pattern.
 */
export function matchesAcceptPattern(
  mimeType: string,
  fileName: string,
  pattern: string,
): boolean {
  const normalized = pattern.trim().toLowerCase();
  if (normalized.length === 0 || normalized === "*" || normalized === "*/*") return true;

  if (normalized.startsWith(".")) {
    return getFileExtension(fileName) === normalized.slice(1);
  }

  if (normalized.endsWith("/*")) {
    return mimeType.toLowerCase().startsWith(normalized.slice(0, -1));
  }

  return mimeType.toLowerCase() === normalized;
}

/**
 * Validates a file against size and type constraints.
 *
 * @param file - The file to validate.
 * @param constraints - Size and MIME type limits.
 * @returns Whether the file is valid, plus human-readable errors.
 */
export function validateFile(file: File, constraints: FileConstraints = {}): FileValidationResult {
  const errors: string[] = [];

  if (constraints.maxSize !== undefined && file.size > constraints.maxSize) {
    errors.push(
      `${file.name} is ${formatBytes(file.size)}, which exceeds the ${formatBytes(constraints.maxSize)} limit.`,
    );
  }

  if (constraints.accept && constraints.accept.length > 0) {
    const accepted = constraints.accept.some((pattern) =>
      matchesAcceptPattern(file.type, file.name, pattern),
    );

    if (!accepted) {
      errors.push(`${file.name} is not an accepted file type.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a batch of files, aggregating every error.
 *
 * @param files - Files to validate.
 * @param constraints - Size and MIME type limits.
 * @returns Combined validity and the full error list.
 */
export function validateFiles(
  files: readonly File[],
  constraints: FileConstraints = {},
): FileValidationResult {
  const errors = files.flatMap((file) => validateFile(file, constraints).errors);
  return { valid: errors.length === 0, errors };
}

/**
 * Reads a file as a data URL.
 *
 * @param file - File to read.
 * @returns A promise resolving to the data URL.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a file as UTF-8 text.
 *
 * @param file - File to read.
 * @returns A promise resolving to the file's text content.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}.`));
    reader.readAsText(file);
  });
}

/**
 * Triggers a browser download for in-memory content.
 *
 * @param content - Blob or string to download.
 * @param fileName - Suggested file name.
 * @param mimeType - MIME type used when `content` is a string.
 */
export function downloadFile(
  content: Blob | string,
  fileName: string,
  mimeType = "text/plain;charset=utf-8",
): void {
  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

/**
 * Replaces characters that are unsafe in file names across platforms.
 *
 * @param fileName - Proposed file name.
 * @returns A sanitised name safe for Windows, macOS, and Linux.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 255);
}
