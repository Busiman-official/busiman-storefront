"use client";

/**
 * Shared chrome for every page under `{companyCode}.busiman.org/admin/...` — the sticky
 * Publish/Discard/Logout toolbar, the EditModeProvider, and AdminNavGuard (which keeps every
 * internal link, anywhere on the page, from ever navigating the shopper out of the admin tree).
 * Each admin route owns its own data fetch (the product, the policy text, the cart) but all of
 * them render their body through this one shell, so the editing chrome and navigation trap never
 * have to be reimplemented per page.
 */
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { StorefrontPolicies, StorefrontSiteDetails } from "@/lib/api";
import { EditModeProvider, type DraftFieldKey, policyKeyFromField } from "./EditModeContext";
import { AdminNavGuard } from "./AdminNavGuard";
import { SectionSidebar } from "./SectionSidebar";
import { GENERIC_PAGE_SECTIONS, type SectionManifestEntry } from "./sectionManifest";

export function AdminShell({
  companyCode,
  initialSiteDetails,
  initialPolicies,
  initialHasDraft,
  sections = GENERIC_PAGE_SECTIONS,
  toolbarExtra,
  children,
}: {
  companyCode: string;
  initialSiteDetails: StorefrontSiteDetails;
  /** Only the policy pages actually read this — every other admin page can leave it unset. */
  initialPolicies?: StorefrontPolicies;
  initialHasDraft: boolean;
  /** This page's section list for the left sidebar — defaults to the generic three-part
   * navbar/content/footer shape every non-home admin page actually has. */
  sections?: SectionManifestEntry[];
  /** Page-specific toolbar controls — e.g. the home page's trust-strip/category-rail toggles,
   * which don't make sense on a product or policy page. Gets the live siteDetails plus a setter so
   * it can optimistically update the shared state the same way EditModeContext's saveField does. */
  toolbarExtra?: (siteDetails: StorefrontSiteDetails, setSiteDetails: (next: StorefrontSiteDetails) => void, markDraft: () => void) => ReactNode;
  children: (siteDetails: StorefrontSiteDetails, policies: StorefrontPolicies) => ReactNode;
}) {
  const router = useRouter();
  const [siteDetails, setSiteDetails] = useState(initialSiteDetails);
  const [policies, setPolicies] = useState<StorefrontPolicies>(initialPolicies ?? {});
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Below md, the sidebar can't sit permanently beside the preview the way it does on desktop —
  // at phone width that leaves the actual storefront preview squeezed into a sliver too narrow for
  // its own grid to render (product cards overlapping, text clipped). It becomes an off-canvas
  // drawer instead, opened from the hamburger button in the toolbar.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFieldSaved = (field: DraftFieldKey, value: string) => {
    const policyKey = policyKeyFromField(field);
    if (policyKey) {
      setPolicies((prev) => ({ ...prev, [policyKey]: value }));
    } else {
      setSiteDetails((prev) => ({ ...prev, [field]: value }));
    }
    setHasDraft(true);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setToast(null);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Couldn't publish. Try again.");
      setHasDraft(false);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't publish. Try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm("Discard all unpublished changes? This can't be undone.")) return;
    setDiscarding(true);
    setToast(null);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/discard-draft`, { method: "POST" });
      if (!res.ok) throw new Error("Couldn't discard. Try again.");
      router.refresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't discard. Try again.");
      setDiscarding(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/logout`, { method: "POST" });
    router.push(`/s/${companyCode}/admin`);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-sf-bg">
      <AdminNavGuard companyCode={companyCode} />

      {/* Desktop: a permanent column beside the preview, pinned to the viewport (sticky + its own
          height) so it keeps its own independent scroll area — without this it has no height cap of
          its own and just scrolls away with the much-taller preview column next to it. */}
      <div className="hidden shrink-0 border-r border-sf-line md:sticky md:top-0 md:block md:h-screen md:w-60">
        <SectionSidebar companyCode={companyCode} markDraft={() => setHasDraft(true)} sections={sections} setSiteDetails={setSiteDetails} siteDetails={siteDetails} />
      </div>

      {/* Mobile: an off-canvas drawer over the preview, dismissed by the backdrop or its own close
          button — never both rendered width-wise at once, so this never fights the column above. */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-60 md:hidden">
          <button aria-label="Close sections menu" className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} type="button" />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-sf-line bg-sf-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-sf-line px-4 py-3">
              <span className="font-heading text-sm font-semibold text-sf-ink">Menu</span>
              <button aria-label="Close" className="cursor-pointer rounded-full p-1 text-sf-ink-soft hover:bg-sf-bg hover:text-sf-ink" onClick={() => setSidebarOpen(false)} type="button">
                <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <SectionSidebar companyCode={companyCode} markDraft={() => setHasDraft(true)} sections={sections} setSiteDetails={setSiteDetails} siteDetails={siteDetails} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-sf-line bg-sf-surface px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <button
              aria-label="Open sections menu"
              className="cursor-pointer rounded-md p-1.5 text-sf-ink-soft hover:bg-sf-bg hover:text-sf-ink md:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="truncate text-sm font-semibold text-sf-ink">Editing {siteDetails.storeName}</span>
            {hasDraft ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Unpublished changes</span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Up to date</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {toast ? <span className="text-xs text-sf-ink-soft">{toast}</span> : null}
            {toolbarExtra ? toolbarExtra(siteDetails, setSiteDetails, () => setHasDraft(true)) : null}
            <button
              className="cursor-pointer rounded-full border border-sf-line px-4 py-1.5 text-xs font-semibold text-sf-ink disabled:opacity-50"
              disabled={!hasDraft || discarding}
              onClick={() => void handleDiscard()}
              type="button"
            >
              {discarding ? "Discarding…" : "Discard draft"}
            </button>
            <button
              className="cursor-pointer rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              disabled={!hasDraft || publishing}
              onClick={() => void handlePublish()}
              type="button"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
            <button
              className="cursor-pointer rounded-full border border-sf-line px-4 py-1.5 text-xs font-semibold text-sf-ink"
              onClick={() => void handleLogout()}
              type="button"
            >
              Log out
            </button>
          </div>
        </div>

        <EditModeProvider onFieldSaved={handleFieldSaved}>{children(siteDetails, policies)}</EditModeProvider>
      </div>
    </div>
  );
}

/** Toggles one boolean siteDetails field against the draft endpoint, with optimistic local update
 * and revert-on-failure — shared by the sidebar's per-section visibility switches. */
export async function toggleDraftBoolean(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  key: "trustStripEnabled" | "categoryRailEnabled" | "announcementEnabled",
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const nextValue = siteDetails[key] === false;
  setSiteDetails({ ...siteDetails, [key]: nextValue });
  markDraft();
  try {
    const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: nextValue }),
    });
    if (!res.ok) throw new Error("");
  } catch {
    setSiteDetails({ ...siteDetails, [key]: !nextValue });
  }
}

/** Sets a section's design/style field. Same optimistic-update/revert shape as toggleDraftBoolean,
 * with one addition for `heroStyle` specifically: switching Hero between Classic <-> Carousel makes
 * the SERVER auto-migrate the image/slide data across the two shapes (see patchDraft's own comment
 * on this), and that migration is invisible to the client's local `siteDetails` — the optimistic
 * `{ [key]: value }` merge only ever sets heroStyle itself, never the heroSlides array the server
 * just populated (or the heroBackgroundImage it just restored going the other way). Left alone, the
 * next slide-list edit (e.g. "Add slide") would build its new array from the client's stale, empty
 * `heroSlides` and overwrite the server's migrated data outright — a real data-loss bug caught by
 * this feature's own Playwright test, not a hypothetical. So for heroStyle only, this re-fetches the
 * draft after a successful save and replaces local siteDetails wholesale with the server's answer,
 * instead of trusting the bare optimistic patch. */
export async function saveDraftStyle(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  key: "navbarStyle" | "heroStyle" | "categoryRailStyle",
  value: string,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const previous = siteDetails[key];
  if (previous === value) return;
  setSiteDetails({ ...siteDetails, [key]: value });
  markDraft();
  try {
    const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) throw new Error("");
    if (key === "heroStyle") {
      const freshRes = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, { cache: "no-store" });
      const freshJson = await freshRes.json().catch(() => null);
      if (freshRes.ok && freshJson?.data?.siteDetails) {
        setSiteDetails(freshJson.data.siteDetails as StorefrontSiteDetails);
      }
    }
  } catch {
    setSiteDetails({ ...siteDetails, [key]: previous });
  }
}

/** Uploads an image file (Navbar's logo, Hero's background — anything sharing this same "upload,
 * save the key" shape), shows it immediately via the upload response's own presigned preview URL
 * (no need to wait for a fresh getDraft round-trip), then saves the returned S3 key — not the
 * preview URL itself — as whichever field, same draft/publish lifecycle as every other field.
 * `position`, when given (Hero's background only — the logo isn't cropped/framed the same way),
 * saves the focal-point X/Y in the exact same PATCH call, so picking a position and uploading reads
 * as one save, not two round-trips the merchant has to wait through separately.
 * Throws on failure so the caller can show an inline error; doesn't revert siteDetails itself since
 * nothing was optimistically changed before the upload actually succeeded. */
export async function uploadAndSaveImage(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  file: File,
  field: "logoUrl" | "heroBackgroundImage",
  uploadPath: "upload-logo" | "upload-hero-image",
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void,
  position?: { x: number; y: number }
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/${uploadPath}`, { method: "POST", body: formData });
  const uploadJson = await uploadRes.json().catch(() => null);
  if (!uploadRes.ok || !uploadJson?.data?.key) {
    throw new Error(uploadJson?.message || "Couldn't upload that image. Try again.");
  }
  const { key, url } = uploadJson.data as { key: string; url: string };

  const previous = { [field]: siteDetails[field], heroImagePositionX: siteDetails.heroImagePositionX, heroImagePositionY: siteDetails.heroImagePositionY };
  const patchBody: Record<string, unknown> = { [field]: key };
  const optimistic: Partial<StorefrontSiteDetails> = { [field]: url };
  if (position) {
    patchBody.heroImagePositionX = position.x;
    patchBody.heroImagePositionY = position.y;
    optimistic.heroImagePositionX = position.x;
    optimistic.heroImagePositionY = position.y;
  }
  setSiteDetails({ ...siteDetails, ...optimistic });
  markDraft();

  const patchRes = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchBody),
  });
  if (!patchRes.ok) {
    setSiteDetails({ ...siteDetails, ...previous });
    throw new Error("Uploaded, but couldn't save it to your draft. Try again.");
  }
}

/** Saves just the focal-point X/Y for an image already uploaded — the "Reposition" flow, no new
 * file involved. Same optimistic-update/revert shape as every other field here. */
export async function savePositionOnly(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  position: { x: number; y: number },
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const previous = { heroImagePositionX: siteDetails.heroImagePositionX, heroImagePositionY: siteDetails.heroImagePositionY };
  setSiteDetails({ ...siteDetails, heroImagePositionX: position.x, heroImagePositionY: position.y });
  markDraft();
  const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ heroImagePositionX: position.x, heroImagePositionY: position.y }),
  });
  if (!res.ok) {
    setSiteDetails({ ...siteDetails, ...previous });
    throw new Error("Couldn't save that position. Try again.");
  }
}

export type HeroSlide = NonNullable<StorefrontSiteDetails["heroSlides"]>[number];

/** Replaces the whole heroSlides array in one PATCH — every slide mutation (add, reposition,
 * delete, reorder) goes through this single helper rather than per-field dot-notation, since the
 * server validates/clamps the array as a unit (patchDraft's own MAX_HERO_SLIDES check needs the
 * full list to count against). Same optimistic-update/revert shape as every other field here.
 * `forServer` is what gets PATCHed (raw S3 keys); `forDisplay` — when different, i.e. only right
 * after a fresh upload — is what local state shows immediately (the presigned preview URL from that
 * upload's own response), since rendering a bare key as an <img src> 404s (see uploadAndAddSlide's
 * own comment). Every other caller (reposition/delete/reorder) only ever rearranges EXISTING slides
 * it already received as presigned URLs from getDraft, so forServer and forDisplay are the same
 * array there — the server's own normalizeSlideImage (storefront-admin.service.ts) strips those
 * presigned URLs back to their real key before persisting, so this never writes an expiring URL into
 * the database even though the client only ever holds display URLs for pre-existing slides. */
async function patchHeroSlides(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  forServer: HeroSlide[],
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void,
  forDisplay: HeroSlide[] = forServer
): Promise<void> {
  const previous = siteDetails.heroSlides;
  setSiteDetails({ ...siteDetails, heroSlides: forDisplay });
  markDraft();
  const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ heroSlides: forServer }),
  });
  if (!res.ok) {
    setSiteDetails({ ...siteDetails, heroSlides: previous });
    throw new Error("Couldn't save your slides. Try again.");
  }
}

/** Uploads a new Hero Carousel slide image and appends it (with its chosen focal point) to the end
 * of the slide list — the upload step is identical to the single-image Hero's own uploadAndSaveImage
 * (same S3 route, same key-not-URL convention), just folded into a slides-array PATCH instead of a
 * flat field. */
export async function uploadAndAddSlide(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  file: File,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void,
  position: { x: number; y: number }
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/upload-hero-image`, { method: "POST", body: formData });
  const uploadJson = await uploadRes.json().catch(() => null);
  if (!uploadRes.ok || !uploadJson?.data?.key) {
    throw new Error(uploadJson?.message || "Couldn't upload that image. Try again.");
  }
  const { key, url } = uploadJson.data as { key: string; url: string };
  // Server-bound slide stores the raw key (same key-not-URL convention every image field here
  // uses); the LOCAL optimistic copy must use the presigned preview `url` instead, or the browser
  // tries to render the bare key as an <img src>, resolves it as a relative path against the admin
  // page's own URL, and 404s — a real bug this feature's own test caught (see patchHeroSlides).
  const nextSlidesForServer = [...(siteDetails.heroSlides ?? []), { image: key, positionX: position.x, positionY: position.y }];
  const nextSlidesForDisplay = [...(siteDetails.heroSlides ?? []), { image: url, positionX: position.x, positionY: position.y }];
  await patchHeroSlides(companyCode, siteDetails, nextSlidesForServer, setSiteDetails, markDraft, nextSlidesForDisplay);
}

/** Saves just one existing slide's focal point — that slide's own "Reposition" flow. */
export async function saveSlidePosition(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  index: number,
  position: { x: number; y: number },
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const current = siteDetails.heroSlides ?? [];
  const nextSlides = current.map((slide, i) => (i === index ? { ...slide, positionX: position.x, positionY: position.y } : slide));
  await patchHeroSlides(companyCode, siteDetails, nextSlides, setSiteDetails, markDraft);
}

/** Saves one slide's text overrides/toggles (heading, description, button text+link, and their
 * show/hide flags) — the "Slide N" detail panel's own Save button. A merge into that one slide's
 * object, same whole-array-replace mechanics as every other slide mutation. */
export async function saveSlideDetails(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  index: number,
  patch: Partial<Pick<HeroSlide, "heading" | "description" | "ctaText" | "ctaUrl" | "showHeading" | "showDescription" | "showCta">>,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const current = siteDetails.heroSlides ?? [];
  const nextSlides = current.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
  await patchHeroSlides(companyCode, siteDetails, nextSlides, setSiteDetails, markDraft);
}

export async function deleteSlide(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  index: number,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const current = siteDetails.heroSlides ?? [];
  const nextSlides = current.filter((_, i) => i !== index);
  await patchHeroSlides(companyCode, siteDetails, nextSlides, setSiteDetails, markDraft);
}

export async function reorderSlides(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  fromIndex: number,
  toIndex: number,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const current = [...(siteDetails.heroSlides ?? [])];
  const [moved] = current.splice(fromIndex, 1);
  current.splice(toIndex, 0, moved);
  await patchHeroSlides(companyCode, siteDetails, current, setSiteDetails, markDraft);
}

/** Sets the carousel's autoplay interval — same optimistic-update/revert shape as saveDraftStyle,
 * just for a numeric (ms) field instead of a string style id. */
export async function saveHeroAutoplay(
  companyCode: string,
  siteDetails: StorefrontSiteDetails,
  ms: number,
  setSiteDetails: (next: StorefrontSiteDetails) => void,
  markDraft: () => void
): Promise<void> {
  const previous = siteDetails.heroAutoplayMs;
  setSiteDetails({ ...siteDetails, heroAutoplayMs: ms });
  markDraft();
  const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ heroAutoplayMs: ms }),
  });
  if (!res.ok) {
    setSiteDetails({ ...siteDetails, heroAutoplayMs: previous });
    throw new Error("Couldn't save that setting. Try again.");
  }
}
