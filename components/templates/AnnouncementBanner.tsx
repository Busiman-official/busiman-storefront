"use client";

/**
 * Split out of shared.tsx (which stays a Server Component module, same as before this editor
 * existed — `formatPrice` and friends must remain callable directly from ClassicTemplate.tsx's own
 * server-rendered logic, not just renderable as JSX) because this is the one piece that actually
 * needs the EditModeContext hook. On the real public storefront this is exactly the old behavior:
 * the scrolling marquee when set, nothing at all when not. In the admin editor it's always a click
 * target — whether or not an announcement is already set — so existing text stays just as editable
 * as adding new text.
 */
import { EditableText } from "@/components/admin/EditableText";
import { useEditMode } from "@/components/admin/EditModeContext";

export function AnnouncementBanner({ companyCode, announcementText }: { companyCode: string; announcementText?: string }) {
  const { active } = useEditMode();

  if (!active) {
    if (!announcementText) return null;
    return (
      <div className="overflow-hidden border-b border-sf-line bg-sf-bg py-1.5 text-xs text-sf-ink-soft">
        <div className="sf-marquee-track flex w-max whitespace-nowrap">
          <span className="px-8">{announcementText}</span>
          <span aria-hidden="true" className="px-8">
            {announcementText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <EditableText
      as="div"
      className="overflow-hidden border-b border-sf-line bg-sf-bg px-8 py-1.5 text-center text-xs text-sf-ink-soft"
      companyCode={companyCode}
      field="announcementText"
      placeholder="Click to add an announcement banner (e.g. a sale or festival-hours notice)"
      value={announcementText ?? ""}
    />
  );
}
