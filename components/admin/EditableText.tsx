"use client";

/**
 * Click-to-edit wrapper for a single plain-text siteDetails field. Outside the admin editor
 * (`active: false`, the real shopper's case) this renders nothing but `children` — same tag, same
 * className, same text node — so the public storefront is byte-identical to before this component
 * existed. Inside the editor, clicking swaps the text for an in-place textarea sized to match, with
 * a small Save/Cancel pair underneath.
 */
import { useId, useRef, useState, type ElementType, type ReactNode } from "react";
import { useEditMode, type DraftFieldKey } from "./EditModeContext";

export function EditableText({
  companyCode,
  field,
  value,
  as: Tag = "span",
  className,
  multiline = false,
  rows = 3,
  placeholder,
  inactiveFallback,
}: {
  companyCode: string;
  field: DraftFieldKey;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  /** Textarea row count while editing — only used when multiline is true. 3 fits a short blurb
   * (about text); a long policy page wants much more room, see AdminPolicyView. */
  rows?: number;
  placeholder?: string;
  /** What a real shopper sees in place of this field when it's unset — e.g. a page whose only
   * content IS this field needs a real sentence, not nothing. Defaults to rendering nothing, which
   * matches every call site that had no such fallback before this editor existed. */
  inactiveFallback?: ReactNode;
}) {
  const { active, openId, openEditor, closeEditor, saveField } = useEditMode();
  const instanceId = useId();
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  if (!active) {
    if (!value) return inactiveFallback ?? null;
    return <Tag className={className}>{value}</Tag>;
  }

  const isEditing = openId === instanceId;

  if (!isEditing) {
    return (
      <Tag
        className={`${className ?? ""} sf-admin-editable`}
        onClick={() => {
          setDraft(value);
          setError(null);
          openEditor(instanceId);
        }}
        role="button"
        tabIndex={0}
      >
        {value || <span className="opacity-50">{placeholder || "Click to add text"}</span>}
      </Tag>
    );
  }

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

  const InputTag = multiline ? "textarea" : "input";

  return (
    <span className="sf-admin-editing inline-block w-full">
      <InputTag
        autoFocus
        className={`${className ?? ""} w-full rounded-md border-2 border-dashed border-current bg-white/90 px-1 text-inherit outline-none`}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        ref={inputRef as never}
        rows={multiline ? rows : undefined}
        value={draft}
      />
      <span className="mt-1.5 flex items-center gap-2 text-xs">
        <button
          className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white disabled:opacity-60"
          disabled={saving}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          className="rounded-full border border-current px-3 py-1 font-semibold"
          disabled={saving}
          onClick={closeEditor}
          type="button"
        >
          Cancel
        </button>
        {error ? <span className="text-red-600">{error}</span> : null}
      </span>
    </span>
  );
}

/** Same click-to-edit affordance for the logo image — the editor swaps the <img> for a plain URL
 * field rather than an upload picker (this v1's deliberately narrow scope: paste a hosted image
 * URL, not a new upload pipeline for a single logo swap). */
export function EditableImageUrl({
  companyCode,
  value,
  children,
}: {
  companyCode: string;
  value: string | undefined;
  children: ReactNode;
}) {
  const { active, openId, openEditor, closeEditor, saveField } = useEditMode();
  const field: DraftFieldKey = "logoUrl";
  const instanceId = useId();
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!active) return <>{children}</>;

  const isEditing = openId === instanceId;
  if (!isEditing) {
    return (
      <span
        className="sf-admin-editable relative inline-block cursor-pointer"
        onClick={() => {
          setDraft(value ?? "");
          setError(null);
          openEditor(instanceId);
        }}
      >
        {children}
      </span>
    );
  }

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
    <span className="sf-admin-editing inline-flex flex-col gap-1.5 rounded-md border-2 border-dashed border-current bg-white/90 p-2 text-xs">
      <input
        autoFocus
        className="w-56 rounded border border-current/40 px-2 py-1 text-xs text-black outline-none"
        onChange={(e) => setDraft(e.target.value)}
        placeholder="https://your-logo-image-url"
        value={draft}
      />
      <span className="flex items-center gap-2">
        <button
          className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white disabled:opacity-60"
          disabled={saving}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="rounded-full border border-current px-3 py-1 font-semibold" disabled={saving} onClick={closeEditor} type="button">
          Cancel
        </button>
      </span>
      {error ? <span className="text-red-600">{error}</span> : null}
    </span>
  );
}
