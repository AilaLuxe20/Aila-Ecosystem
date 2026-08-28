"use client";

import { useMemo } from "react";
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils/cn";
import { isExternalUrl } from "@/lib/utils/url";

import { CodeBlock, InlineCode } from "./CodeBlock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

/**
 * Markdown rendering.
 *
 * `react-markdown` parses to an AST and renders React elements rather than
 * injecting HTML, so untrusted markdown cannot introduce script tags. Raw HTML
 * is deliberately not enabled.
 *
 * Every element is mapped to a design-system component, so rendered markdown is
 * visually identical to hand-authored UI.
 */

/**
 * Extracts the plain-text content of a React node.
 *
 * Needed because a code fence's children arrive as nested React elements, and
 * highlight.js needs the raw source string.
 *
 * @param node - The node to flatten.
 * @returns The concatenated text.
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");

  if (
    typeof node === "object" &&
    node !== null &&
    "props" in node &&
    typeof node.props === "object" &&
    node.props !== null &&
    "children" in node.props
  ) {
    return extractText((node.props as { children: React.ReactNode }).children);
  }

  return "";
}

/** Props for {@link MarkdownRenderer}. */
export interface MarkdownRendererProps {
  /** The markdown source. */
  readonly content: string;
  /** Additional classes applied to the wrapper. */
  readonly className?: string;
  /** Renders at a smaller scale, for use in cards and side panels. */
  readonly compact?: boolean;
}

/**
 * Renders markdown using design-system components.
 *
 * GitHub Flavored Markdown is enabled, which adds tables, task lists,
 * strikethrough, and autolinks.
 *
 * @param props - Markdown source, sizing, and wrapper classes.
 * @returns The rendered markdown.
 *
 * @example
 * <MarkdownRenderer content={message.body} />
 */
export function MarkdownRenderer({
  content,
  className,
  compact = false,
}: MarkdownRendererProps): React.JSX.Element {
  const components = useMemo<Components>(
    () => ({
      h1: ({ children }) => (
        <h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-white first:mt-0">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-6 mb-3 text-lg font-semibold tracking-tight text-white first:mt-0">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-5 mb-2 text-base font-semibold tracking-tight text-white first:mt-0">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="mt-4 mb-2 text-sm font-semibold text-white first:mt-0">{children}</h4>
      ),
      p: ({ children }) => <p className="my-3 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
      ul: ({ children }) => (
        <ul className="my-3 list-disc space-y-1 ps-5 marker:text-white/30">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="my-3 list-decimal space-y-1 ps-5 marker:text-white/30">{children}</ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-s-2 border-brand-500/50 ps-4 text-white/60 italic">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-hairline" />,
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      a: ({ href, children }) => {
        const safeHref =
          typeof href === "string" ? defaultUrlTransform(href) : "";

        if (!safeHref) {
          return <span>{children}</span>;
        }

        const external = isExternalUrl(safeHref);

        return (
          <a
            href={safeHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer nofollow" : undefined}
            className="text-brand-400 underline decoration-brand-400/40 underline-offset-2 transition-colors hover:decoration-brand-400"
          >
            {children}
          </a>
        );
      },
      code: ({ className: codeClassName, children }) => {
        const language = /language-([\w+-]+)/.exec(codeClassName ?? "")?.[1];
        const text = extractText(children).replace(/\n$/, "");

        // A fenced block always carries a `language-*` class or a newline;
        // anything else is an inline span.
        const isBlock = Boolean(language) || text.includes("\n");

        if (!isBlock) return <InlineCode>{text}</InlineCode>;

        return <CodeBlock code={text} language={language} className="my-4" />;
      },
      pre: ({ children }) => <>{children}</>,
      table: ({ children }) => <Table className="my-4">{children}</Table>,
      thead: ({ children }) => <TableHeader>{children}</TableHeader>,
      tbody: ({ children }) => <TableBody>{children}</TableBody>,
      tr: ({ children }) => <TableRow>{children}</TableRow>,
      th: ({ children }) => <TableHead>{children}</TableHead>,
      td: ({ children }) => <TableCell>{children}</TableCell>,
      img: ({ src, alt }) => {
        const safeSrc =
          typeof src === "string" ? defaultUrlTransform(src) : "";

        if (!safeSrc) {
          return null;
        }

        return (
          // Remote markdown images are not limited to next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeSrc}
            alt={alt ?? ""}
            loading="lazy"
            className="my-4 max-w-full rounded-panel border border-hairline"
          />
        );
      },
    }),
    [],
  );

  if (!content.trim()) {
    return (
      <div
        className={cn(
          "text-white/75",
          compact ? "text-xs" : "text-sm",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "max-w-full overflow-x-auto break-words text-white/75",
        compact ? "text-xs [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm" : "text-sm",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={defaultUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
