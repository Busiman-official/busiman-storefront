/**
 * Renders merchant-written policy/about text as real Markdown — headings, bold/italic, bullet and
 * numbered lists, links, tables (via remark-gfm) — rather than a flat whitespace-pre-line paragraph.
 * A plain .md file pasted into the editor (see EditableMarkdown) renders correctly here with zero
 * extra handling, since react-markdown parses standard Markdown directly; nothing here is
 * storefront-specific beyond the `.sf-markdown` class that styles the output (see globals.css).
 *
 * react-markdown renders to React elements, never raw HTML (no dangerouslySetInnerHTML, and HTML
 * embedded in the source text is dropped by default) — safe to render merchant-authored text
 * without a separate sanitization pass.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ text, className }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return (
    <div className={`sf-markdown ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
