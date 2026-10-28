"use client";

/**
 * Markdown-aware sibling of EditableText, for the two fields long enough to need real formatting
 * (policy pages, About text) — a toolbar that inserts Markdown syntax at the cursor, a raw-text
 * textarea (so pasting the contents of a .md file just works — it's plain text, no special paste
 * handling needed), and a Preview toggle that renders through the same MarkdownContent component
 * both the live admin preview and the real public page use. Outside the editor this renders
 * nothing but real Markdown output — same passthrough guarantee EditableText makes.
 */
import { useId, useRef, useState, type ReactNode } from "react";
import { useEditMode, type DraftFieldKey } from "./EditModeContext";
import { MarkdownContent } from "@/components/MarkdownContent";

function applyInlineFormat(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholderText: string
): { value: string; selStart: number; selEnd: number } {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end) || placeholderText;
  const nextValue = value.slice(0, start) + before + selected + after + value.slice(end);
  return { value: nextValue, selStart: start + before.length, selEnd: start + before.length + selected.length };
}

/** Line-prefix formats (heading/list markers) apply to the start of the current line, not wherever
 * the cursor happens to be mid-word — matches how every Markdown editor's toolbar behaves. */
function applyLinePrefix(textarea: HTMLTextAreaElement, prefix: string): { value: string; selStart: number; selEnd: number } {
  const { selectionStart: start, value } = textarea;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const cursor = start + prefix.length;
  return { value: nextValue, selStart: cursor, selEnd: cursor };
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      className="min-w-7 cursor-pointer rounded px-1.5 py-1 text-xs font-semibold text-current hover:bg-current/10"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function EditableMarkdown({
  companyCode,
  field,
  value,
  className,
  placeholder,
  inactiveFallback,
}: {
  companyCode: string;
  field: DraftFieldKey;
  value: string;
  className?: string;
  placeholder?: string;
  inactiveFallback?: ReactNode;
}) {
  const { active, openId, openEditor, closeEditor, saveField } = useEditMode();
  const instanceId = useId();
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!active) {
    if (!value) return inactiveFallback ?? null;
    return <MarkdownContent className={className} text={value} />;
  }

  const isEditing = openId === instanceId;

  if (!isEditing) {
    return (
      <div
        className="sf-admin-editable cursor-pointer rounded-md outline-1 outline-dashed outline-transparent hover:outline-current"
        onClick={() => {
          setDraft(value);
          setError(null);
          setPreviewing(false);
          openEditor(instanceId);
        }}
        role="button"
        tabIndex={0}
      >
        {value ? <MarkdownContent className={className} text={value} /> : <span className="text-sm opacity-50">{placeholder || "Click to write"}</span>}
      </div>
    );
  }

  const format = (apply: (ta: HTMLTextAreaElement) => { value: string; selStart: number; selEnd: number }) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value: nextValue, selStart, selEnd } = apply(ta);
    setDraft(nextValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveField(companyCode, field, draft);
      closeEditor();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sf-admin-editing w-full">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 border-current/30 bg-white/80 px-1.5 py-1">
        <ToolbarButton label="Bold" onClick={() => format((ta) => applyInlineFormat(ta, "**", "**", "bold text"))}>
          B
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => format((ta) => applyInlineFormat(ta, "_", "_", "italic text"))}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => format((ta) => applyLinePrefix(ta, "## "))}>
          H2
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => format((ta) => applyLinePrefix(ta, "- "))}>
          List
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => format((ta) => applyLinePrefix(ta, "1. "))}>
          1.
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={() => format((ta) => applyInlineFormat(ta, "[", "](https://)", "link text"))}>
          Link
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-current/20" />
        <button
          className="ml-auto cursor-pointer rounded-full border border-current/30 px-2.5 py-1 text-xs font-semibold"
          onClick={() => setPreviewing((p) => !p)}
          type="button"
        >
          {previewing ? "Edit" : "Preview"}
        </button>
      </div>

      {previewing ? (
        <div className="min-h-48 rounded-b-md border border-current/30 bg-white/90 p-3">
          <MarkdownContent text={draft} />
        </div>
      ) : (
        <textarea
          autoFocus
          className="w-full rounded-b-md border border-current/30 bg-white/90 p-3 font-mono text-xs text-inherit outline-none"
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write or paste Markdown — headings with ##, **bold**, - bullet lists, 1. numbered lists, [links](url)"
          ref={textareaRef}
          rows={16}
          value={draft}
        />
      )}

      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <button
          className="cursor-pointer rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white disabled:opacity-60"
          disabled={saving}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="cursor-pointer rounded-full border border-current px-3 py-1 font-semibold" disabled={saving} onClick={closeEditor} type="button">
          Cancel
        </button>
        {error ? <span className="text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
