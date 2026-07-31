"use client";

import hljs from "highlight.js/lib/common";
import { Check, Copy } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { useClipboard } from "@/hooks/use-clipboard";

import { IconButton } from "./Button";

/**
 * Syntax-highlighted code display.
 *
 * Uses the `common` bundle of highlight.js rather than the full one — it covers
 * the languages this platform actually renders at roughly a fifth of the
 * payload.
 */

/** Props for {@link CodeBlock}. */
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The source to display. */
  readonly code: string;
  /** Language hint. Auto-detected when omitted. */
  readonly language?: string;
  /** File name or caption shown in the header. */
  readonly filename?: string;
  /** Renders a gutter of line numbers. */
  readonly showLineNumbers?: boolean;
  /** Hides the copy control. */
  readonly hideCopy?: boolean;
  /** Caps the height and scrolls beyond it, in CSS units. */
  readonly maxHeight?: string;
  /** Line numbers to emphasise. */
  readonly highlightLines?: readonly number[];
}

/**
 * Highlights source and returns HTML.
 *
 * highlight.js escapes its input, so the result is safe to inject. Auto-
 * detection is limited to the common set so a stray token cannot cause a wild
 * mis-detection.
 *
 * @param code - The source to highlight.
 * @param language - Language hint, or undefined to auto-detect.
 * @returns Highlighted HTML.
 */
function highlight(code: string, language?: string): string {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    // Highlighting is presentational; on failure fall back to escaped plain text.
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

/**
 * A code block with syntax highlighting, line numbers, and copy-to-clipboard.
 *
 * @param props - Code, language, display options, and div attributes.
 * @returns The code block element.
 *
 * @example
 * <CodeBlock code={snippet} language="typescript" filename="client.ts" showLineNumbers />
 */
export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  hideCopy = false,
  maxHeight,
  highlightLines = [],
  className,
  ...props
}: CodeBlockProps): React.JSX.Element {
  const { copy, copied } = useClipboard();

  const lines = useMemo(() => {
    const highlighted = highlight(code, language);
    return highlighted.split("\n");
  }, [code, language]);

  const emphasised = useMemo(() => new Set(highlightLines), [highlightLines]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-panel border border-hairline bg-surface-sunken",
        className,
      )}
      {...props}
    >
      {filename || !hideCopy ? (
        <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-1.5">
          <span className="truncate font-mono text-2xs text-white/45">
            {filename ?? language ?? "code"}
          </span>

          {hideCopy ? null : (
            <IconButton
              label={copied ? "Copied" : "Copy code"}
              icon={copied ? <Check /> : <Copy />}
              variant="ghost"
              size="xs"
              onClick={() => void copy(code)}
              className={copied ? "text-success" : undefined}
            />
          )}
        </div>
      ) : null}

      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <pre className="min-w-full p-3 font-mono text-xs leading-relaxed">
          <code className="hljs block">
            {lines.map((line, index) => (
              <span
                key={index}
                className={cn(
                  "block min-h-[1.5em] px-1",
                  emphasised.has(index + 1) &&
                    "-mx-1 border-s-2 border-brand-500 bg-brand-500/8 px-2",
                )}
              >
                {showLineNumbers ? (
                  <span
                    aria-hidden
                    className="me-4 inline-block w-8 select-none text-end text-white/20 tabular-nums"
                  >
                    {index + 1}
                  </span>
                ) : null}

                <span dangerouslySetInnerHTML={{ __html: line || " " }} />
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/** Props for {@link InlineCode}. */
export type InlineCodeProps = React.HTMLAttributes<HTMLElement>;

/**
 * A short code fragment rendered inline with prose.
 *
 * @param props - Element attributes.
 * @returns The inline code element.
 */
export function InlineCode({ className, ...props }: InlineCodeProps): React.JSX.Element {
  return (
    <code
      className={cn(
        "rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-brand-300",
        className,
      )}
      {...props}
    />
  );
}
