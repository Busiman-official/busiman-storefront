"use client";

/**
 * Lets the SAME template components (ClassicTemplate etc.) serve both the real public storefront
 * and the admin editor's live preview — the only way to guarantee true WYSIWYG without a second,
 * drift-prone preview renderer. Public pages never render a Provider, so `useEditMode()` always
 * returns `active: false` there, and EditableText/EditableImage fall through to a plain passthrough
 * with zero extra DOM or behavior — a real shopper's page is byte-identical to today.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type DraftFieldKey =
  | "storeName"
  | "aboutText"
  | "announcementText"
  | "logoUrl"
  | "accentColor"
  // Policy text lives in its own `policies` sub-document on the server (see
  // storefront-admin.service.ts's StorefrontDraftPatch), not siteDetails — this "policy:" prefix
  // is how saveField below tells the two apart and builds the right PATCH body for each.
  | "policy:shipping"
  | "policy:returns"
  | "policy:terms"
  | "policy:privacy";

export function policyKeyFromField(field: DraftFieldKey): string | null {
  return field.startsWith("policy:") ? field.slice("policy:".length) : null;
}

interface EditModeContextValue {
  active: boolean;
  /** Which EDITOR INSTANCE's popover is open, if any — an opaque id (see EditableText's own
   * `useId()`), never the bare field name. storeName appears twice on the home page (hero + navbar,
   * same field, two separate EditableText elements); keying this by field name alone would open
   * both simultaneously the moment either was clicked, letting whichever one you *didn't* mean to
   * edit silently discard your change when both closed together. Per-instance ids keep "which
   * editor is open" and "which field does it write" fully independent. */
  openId: string | null;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  /** Saves one field to the draft via the Next.js proxy route, then calls onSaved so the page's
   * local state (and hence every EditableText bound to that field) reflects it immediately —
   * no full page reload needed to see your own edit. */
  saveField: (companyCode: string, field: DraftFieldKey, value: string) => Promise<void>;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext);
  if (ctx) return ctx;
  // No Provider above us (the public storefront's normal case) — a stable, inert fallback so
  // every consumer can call this hook unconditionally.
  return {
    active: false,
    openId: null,
    openEditor: () => {},
    closeEditor: () => {},
    saveField: async () => {},
  };
}

export function EditModeProvider({
  children,
  onFieldSaved,
}: {
  children: ReactNode;
  /** Called after a successful save with the field+value, so the admin page can update the live
   * preview's local siteDetails copy without a re-fetch. */
  onFieldSaved: (field: DraftFieldKey, value: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const saveField = useCallback(
    async (companyCode: string, field: DraftFieldKey, value: string) => {
      const policyKey = policyKeyFromField(field);
      const body = policyKey ? { policies: { [policyKey]: value } } : { [field]: value };
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Couldn't save your change. Try again.");
      }
      onFieldSaved(field, value);
    },
    [onFieldSaved]
  );

  return (
    <EditModeContext.Provider
      value={{
        active: true,
        openId,
        openEditor: setOpenId,
        closeEditor: () => setOpenId(null),
        saveField,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
