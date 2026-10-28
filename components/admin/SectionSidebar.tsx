"use client";

/**
 * Left rail for the admin editor — lists this page's sections, lets a merchant toggle the
 * genuinely optional ones on/off, and drills into a per-section detail view (design picker +
 * section-specific settings, e.g. Navbar's logo upload) the way clicking a row in Shopify's own
 * theme editor does. Clicking anywhere on a row (not the toggle switch itself) also scrolls the
 * live preview to that section with a brief highlight, so "what is this section" is never a guess.
 */
import { useRef, useState } from "react";
import type { StorefrontSiteDetails } from "@/lib/api";
import { isSectionVisible, type SectionFormField, type SectionImageSetting, type SectionManifestEntry } from "./sectionManifest";
import {
  toggleDraftBoolean,
  saveDraftStyle,
  uploadAndSaveImage,
  savePositionOnly,
  uploadAndAddSlide,
  saveSlidePosition,
  saveSlideDetails,
  deleteSlide,
  reorderSlides,
  saveHeroAutoplay,
  type HeroSlide,
} from "./AdminShell";
import { StoreDetailsSettings } from "./StoreDetailsSettings";
import { ImagePositionModal } from "./ImagePositionModal";

function scrollToSection(domId: string) {
  const el = document.getElementById(domId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("sf-admin-section-highlight");
  window.setTimeout(() => el.classList.remove("sf-admin-section-highlight"), 1500);
}

export function SectionSidebar({
  companyCode,
  sections,
  siteDetails,
  setSiteDetails,
  markDraft,
}: {
  companyCode: string;
  sections: SectionManifestEntry[];
  siteDetails: StorefrontSiteDetails;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const open = sections.find((s) => s.key === openKey) ?? null;

  return (
    <aside className="h-full overflow-y-auto bg-sf-surface">
      {showSettings ? (
        <StoreDetailsSettings
          companyCode={companyCode}
          markDraft={markDraft}
          onBack={() => setShowSettings(false)}
          setSiteDetails={setSiteDetails}
          siteDetails={siteDetails}
        />
      ) : open ? (
        <SectionDetail
          companyCode={companyCode}
          entry={open}
          markDraft={markDraft}
          onBack={() => setOpenKey(null)}
          setSiteDetails={setSiteDetails}
          siteDetails={siteDetails}
        />
      ) : (
        <>
          <div className="border-b border-sf-line px-4 py-3">
            <h2 className="font-heading text-sm font-semibold text-sf-ink">Sections</h2>
          </div>
          <ul>
            {sections.map((entry) => (
              <SectionRow
                companyCode={companyCode}
                entry={entry}
                key={entry.key}
                markDraft={markDraft}
                onOpen={() => {
                  setOpenKey(entry.key);
                  scrollToSection(entry.domId);
                }}
                setSiteDetails={setSiteDetails}
                siteDetails={siteDetails}
              />
            ))}
          </ul>

          <div className="border-t border-sf-line px-4 py-3">
            <h2 className="font-heading text-sm font-semibold text-sf-ink">Settings</h2>
          </div>
          <button
            className="flex w-full cursor-pointer items-center justify-between gap-2 border-b border-sf-line px-4 py-3 text-left hover:bg-sf-bg"
            onClick={() => setShowSettings(true)}
            type="button"
          >
            <span className="text-sm text-sf-ink">Store details</span>
            <svg aria-hidden="true" className="text-sf-ink-soft" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </aside>
  );
}

function SectionRow({
  entry,
  siteDetails,
  companyCode,
  setSiteDetails,
  markDraft,
  onOpen,
}: {
  entry: SectionManifestEntry;
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
  onOpen: () => void;
}) {
  const visible = isSectionVisible(entry, siteDetails);
  const [busy, setBusy] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!entry.toggleField || busy) return;
    setBusy(true);
    void toggleDraftBoolean(companyCode, siteDetails, entry.toggleField, setSiteDetails, markDraft).finally(() => setBusy(false));
  };

  return (
    <li className="border-b border-sf-line">
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left hover:bg-sf-bg"
        onClick={() => {
          scrollToSection(entry.domId);
          onOpen();
        }}
        type="button"
      >
        <span className="truncate text-sm text-sf-ink">{entry.label}</span>
        {entry.toggleField ? (
          <span
            aria-checked={visible}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${visible ? "bg-emerald-600" : "bg-sf-line"} ${busy ? "opacity-60" : ""}`}
            onClick={handleToggle}
            role="switch"
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visible ? "translate-x-[1.125rem]" : "translate-x-0.5"}`} />
          </span>
        ) : (
          <span className="shrink-0 text-xs text-sf-ink-soft">Always shown</span>
        )}
      </button>
    </li>
  );
}

function SectionDetail({
  entry,
  siteDetails,
  companyCode,
  setSiteDetails,
  markDraft,
  onBack,
}: {
  entry: SectionManifestEntry;
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
  onBack: () => void;
}) {
  const visible = isSectionVisible(entry, siteDetails);
  const currentStyle = entry.styleField ? siteDetails[entry.styleField] : undefined;
  const isHeroCarousel = entry.key === "hero" && currentStyle === "carousel";

  return (
    <div>
      <button
        className="flex w-full cursor-pointer items-center gap-1.5 border-b border-sf-line px-4 py-3 text-left text-sm font-medium text-sf-ink hover:bg-sf-bg"
        onClick={onBack}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {entry.label}
      </button>

      <div className="space-y-5 px-4 py-4">
        {entry.designs && entry.designs.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Design</p>
            <div className="grid grid-cols-2 gap-2">
              {entry.designs.map((design) => {
                const selected = currentStyle === design.id || (currentStyle == null && entry.designs?.[0]?.id === design.id);
                return (
                  <button
                    className={`cursor-pointer rounded-lg border p-3 text-left text-xs font-medium transition-colors ${
                      selected ? "border-sf-ink bg-sf-bg text-sf-ink" : "border-sf-line text-sf-ink-soft hover:border-sf-ink-soft"
                    }`}
                    key={design.id}
                    onClick={() => {
                      if (!entry.styleField) return;
                      void saveDraftStyle(companyCode, siteDetails, entry.styleField, design.id, setSiteDetails, markDraft);
                    }}
                    type="button"
                  >
                    <span className="flex items-center justify-between">
                      {design.label}
                      {selected ? (
                        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
                          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Hidden for Carousel — each slide has its own heading/description/button now (see
            SlideDetailPanel), so this shared form would just be a second, redundant/confusing place
            to type the same kind of text. Still shown for Classic, which has no per-slide concept. */}
        {entry.formFields && entry.formFields.length > 0 && !isHeroCarousel ? (
          <SectionFormFields companyCode={companyCode} fields={entry.formFields} markDraft={markDraft} setSiteDetails={setSiteDetails} siteDetails={siteDetails} />
        ) : null}

        {isHeroCarousel ? (
          <HeroSlidesManager companyCode={companyCode} markDraft={markDraft} setSiteDetails={setSiteDetails} siteDetails={siteDetails} />
        ) : (
          entry.images?.map((img) => (
            <ImageSetting companyCode={companyCode} image={img} key={img.field} markDraft={markDraft} setSiteDetails={setSiteDetails} siteDetails={siteDetails} />
          ))
        )}

        {entry.toggleField ? (
          <div className="space-y-2 border-t border-sf-line pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Visibility</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink">
              <input
                checked={visible}
                onChange={() => void toggleDraftBoolean(companyCode, siteDetails, entry.toggleField!, setSiteDetails, markDraft)}
                type="checkbox"
              />
              Show this section
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** A section's own inline text form — e.g. Hero's heading/description/button text — saved together
 * in one PATCH, same "review together, save together" reasoning as StoreDetailsSettings, just
 * scoped to whichever fields that one section declares instead of the whole store's identity. */
function SectionFormFields({
  fields,
  siteDetails,
  companyCode,
  setSiteDetails,
  markDraft,
}: {
  fields: SectionFormField[];
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
}) {
  const toValues = () => Object.fromEntries(fields.map((f) => [f.key, siteDetails[f.key] ?? ""])) as Record<string, string>;
  const [form, setForm] = useState<Record<string, string>>(toValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const baseline = toValues();
  const dirty = fields.some((f) => form[f.key] !== baseline[f.key]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Couldn't save your changes. Try again.");
      setSiteDetails({ ...siteDetails, ...form });
      markDraft();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-sf-line pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Text</p>
      {fields.map((field) => (
        <label className="block space-y-1" key={field.key}>
          <span className="text-xs text-sf-ink-soft">{field.label}</span>
          {field.multiline ? (
            <textarea
              className="w-full rounded-md border border-sf-line bg-white px-3 py-2 text-sm text-sf-ink outline-none focus:border-sf-ink-soft"
              onChange={(e) => {
                setForm((prev) => ({ ...prev, [field.key]: e.target.value }));
                setSaved(false);
              }}
              placeholder={field.placeholder}
              rows={3}
              value={form[field.key]}
            />
          ) : (
            <input
              className="w-full rounded-md border border-sf-line bg-white px-3 py-2 text-sm text-sf-ink outline-none focus:border-sf-ink-soft"
              onChange={(e) => {
                setForm((prev) => ({ ...prev, [field.key]: e.target.value }));
                setSaved(false);
              }}
              placeholder={field.placeholder}
              value={form[field.key]}
            />
          )}
        </label>
      ))}
      <div className="flex items-center gap-2">
        <button
          className="cursor-pointer rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? "Saving…" : "Save text"}
        </button>
        {dirty ? (
          <button
            className="cursor-pointer rounded-full border border-sf-line px-3 py-1.5 text-xs font-semibold text-sf-ink"
            disabled={saving}
            onClick={() => {
              setForm(baseline);
              setSaved(false);
            }}
            type="button"
          >
            Reset
          </button>
        ) : null}
      </div>
      {saved ? <p className="text-xs text-emerald-700">Saved to your draft.</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

/** One upload control for one section-declared image field — Navbar's logo, Hero's background
 * photo, anything else that shares this exact "upload, preview instantly, save the S3 key" shape.
 * When `image.supportsPosition` is set, picking a file (or clicking "Reposition" on one already
 * uploaded) opens the drag-anywhere focal-point modal before anything is saved. */
export function ImageSetting({
  siteDetails,
  companyCode,
  image,
  setSiteDetails,
  markDraft,
}: {
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  image: SectionImageSetting;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentUrl = siteDetails[image.field];

  // Drives the position modal for BOTH a freshly picked file (pendingFile set, previewUrl is a
  // local object URL) and a reposition-only pass on the image already saved (pendingFile null,
  // previewUrl is the existing presigned URL) — one modal, two entry points.
  const [modal, setModal] = useState<{ previewUrl: string; pendingFile: File | null } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleFilePicked = (file: File) => {
    setError(null);
    if (image.supportsPosition) {
      setModal({ previewUrl: URL.createObjectURL(file), pendingFile: file });
      return;
    }
    void (async () => {
      setUploading(true);
      try {
        await uploadAndSaveImage(companyCode, siteDetails, file, image.field, image.uploadPath, setSiteDetails, markDraft);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't upload that image. Try again.");
      } finally {
        setUploading(false);
      }
    })();
  };

  const closeModal = () => {
    if (modal?.pendingFile) URL.revokeObjectURL(modal.previewUrl);
    setModal(null);
    setModalError(null);
  };

  const handleConfirmPosition = async (position: { x: number; y: number }) => {
    if (!modal) return;
    setUploading(true);
    setModalError(null);
    try {
      if (modal.pendingFile) {
        await uploadAndSaveImage(companyCode, siteDetails, modal.pendingFile, image.field, image.uploadPath, setSiteDetails, markDraft, position);
      } else {
        await savePositionOnly(companyCode, siteDetails, position, setSiteDetails, markDraft);
      }
      closeModal();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-sf-line pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">{image.label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-sf-line bg-sf-bg">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={image.label} className="h-full w-full object-cover" src={currentUrl} />
          ) : (
            <span className="text-[10px] text-sf-ink-soft">None</span>
          )}
        </div>
        <button
          className="cursor-pointer rounded-full border border-sf-line px-3 py-1.5 text-xs font-semibold text-sf-ink disabled:opacity-60"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        {image.supportsPosition && currentUrl ? (
          <button
            aria-label="Reposition image"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-sf-line text-sf-ink disabled:opacity-60"
            disabled={uploading}
            onClick={() => setModal({ previewUrl: currentUrl, pendingFile: null })}
            title="Reposition image"
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M12 2v20M2 12h20M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3" />
            </svg>
          </button>
        ) : null}
        <input
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFilePicked(file);
          }}
          ref={inputRef}
          type="file"
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {modal ? (
        <ImagePositionModal
          busy={uploading}
          error={modalError}
          imageUrl={modal.previewUrl}
          initialPosition={{ x: siteDetails.heroImagePositionX ?? 50, y: siteDetails.heroImagePositionY ?? 50 }}
          onCancel={closeModal}
          onConfirm={(position) => void handleConfirmPosition(position)}
        />
      ) : null}
    </div>
  );
}

const MAX_HERO_SLIDES = 5;
/** Only a few fixed choices, never a free-text ms field — see EcommerceSite.model.ts's own comment
 * on heroAutoplayMs for why. */
const AUTOPLAY_OPTIONS: Array<{ ms: number; label: string }> = [
  { ms: 0, label: "Off" },
  { ms: 3000, label: "3s" },
  { ms: 5000, label: "5s" },
  { ms: 8000, label: "8s" },
];

/** Hero's "Carousel" design panel — replaces the single ImageSetting row the Classic design uses,
 * with a reorderable list of slides (each its own focal point, reusing ImagePositionModal exactly
 * as Classic's single image does), an autoplay-speed picker, and — per slide — a drill-down into
 * that slide's own heading/description/button text (SlideDetailPanel below), each independently
 * hideable so a slide can be pure background photo. The shared Heading/Description/Button
 * fields in SectionFormFields above this become each slide's fallback when it hasn't set its own
 * override (see HeroCarousel.tsx's own comment on the fallback chain). */
function HeroSlidesManager({
  siteDetails,
  companyCode,
  setSiteDetails,
  markDraft,
}: {
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
}) {
  const slides = siteDetails.heroSlides ?? [];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // index === null means "adding a brand-new slide" (pendingFile set); otherwise it's an existing
  // slide's own "Reposition" flow, same two-entry-points-one-modal shape as ImageSetting.
  const [modal, setModal] = useState<{ index: number | null; previewUrl: string; pendingFile: File | null } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (editingIndex != null && slides[editingIndex]) {
    return (
      <SlideDetailPanel
        companyCode={companyCode}
        index={editingIndex}
        markDraft={markDraft}
        onBack={() => setEditingIndex(null)}
        setSiteDetails={setSiteDetails}
        siteDetails={siteDetails}
        slide={slides[editingIndex]}
      />
    );
  }

  const handleFilePicked = (file: File) => {
    setError(null);
    setModal({ index: null, previewUrl: URL.createObjectURL(file), pendingFile: file });
  };

  const closeModal = () => {
    if (modal?.pendingFile) URL.revokeObjectURL(modal.previewUrl);
    setModal(null);
    setModalError(null);
  };

  const handleConfirmPosition = async (position: { x: number; y: number }) => {
    if (!modal) return;
    setUploading(true);
    setModalError(null);
    try {
      if (modal.pendingFile) {
        await uploadAndAddSlide(companyCode, siteDetails, modal.pendingFile, setSiteDetails, markDraft, position);
      } else if (modal.index != null) {
        await saveSlidePosition(companyCode, siteDetails, modal.index, position, setSiteDetails, markDraft);
      }
      closeModal();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex == null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    void reorderSlides(companyCode, siteDetails, dragIndex, toIndex, setSiteDetails, markDraft);
    setDragIndex(null);
  };

  return (
    <div className="space-y-3 border-t border-sf-line pt-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Slides</p>
      </div>
      <ul className="space-y-2">
        {slides.map((slide, index) => (
          <li
            className={`flex items-center gap-2 rounded-md border border-sf-line p-1.5 ${dragIndex === index ? "opacity-50" : ""}`}
            draggable
            key={slide.image + index}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={() => setDragIndex(index)}
            onDrop={() => handleDrop(index)}
          >
            <span aria-hidden="true" className="shrink-0 cursor-grab px-1 text-sf-ink-soft" title="Drag to reorder">
              <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
              </svg>
            </span>
            <button
              className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded border border-sf-line"
              onClick={() => setModal({ index, previewUrl: slide.image, pendingFile: null })}
              title="Reposition this slide"
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`Slide ${index + 1}`} className="h-full w-full object-cover" src={slide.image} />
            </button>
            <button
              className="flex flex-1 cursor-pointer items-center justify-between gap-1 truncate rounded px-1 py-1 text-left text-xs text-sf-ink hover:bg-sf-bg"
              onClick={() => setEditingIndex(index)}
              type="button"
            >
              <span className="truncate">Slide {index + 1}</span>
              <svg aria-hidden="true" className="shrink-0 text-sf-ink-soft" fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label={`Remove slide ${index + 1}`}
              className="shrink-0 cursor-pointer rounded-full p-1 text-sf-ink-soft hover:bg-sf-bg hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={slides.length <= 2}
              onClick={() => void deleteSlide(companyCode, siteDetails, index, setSiteDetails, markDraft)}
              title={slides.length <= 2 ? "Add another slide before removing this one, or switch back to Classic" : "Remove slide"}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <button
        className="w-full cursor-pointer rounded-full border border-sf-line py-1.5 text-xs font-semibold text-sf-ink disabled:cursor-not-allowed disabled:opacity-50"
        disabled={uploading || slides.length >= MAX_HERO_SLIDES}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {uploading ? "Uploading…" : slides.length >= MAX_HERO_SLIDES ? `Max ${MAX_HERO_SLIDES} slides` : "Add slide"}
      </button>
      <input
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleFilePicked(file);
        }}
        ref={inputRef}
        type="file"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="space-y-1.5 border-t border-sf-line pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Autoplay</p>
        <div className="flex gap-1.5">
          {AUTOPLAY_OPTIONS.map((opt) => {
            const selected = (siteDetails.heroAutoplayMs ?? 5000) === opt.ms;
            return (
              <button
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
                  selected ? "border-sf-ink bg-sf-bg text-sf-ink" : "border-sf-line text-sf-ink-soft hover:border-sf-ink-soft"
                }`}
                key={opt.ms}
                onClick={() => void saveHeroAutoplay(companyCode, siteDetails, opt.ms, setSiteDetails, markDraft)}
                type="button"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {modal ? (
        <ImagePositionModal
          busy={uploading}
          error={modalError}
          imageUrl={modal.previewUrl}
          initialPosition={modal.index != null ? { x: slides[modal.index]?.positionX ?? 50, y: slides[modal.index]?.positionY ?? 50 } : { x: 50, y: 50 }}
          onCancel={closeModal}
          onConfirm={(position) => void handleConfirmPosition(position)}
        />
      ) : null}
    </div>
  );
}

/** One slide's own heading/description/button — each a text field paired with its own show/hide
 * toggle, so a slide can keep typed text around but hidden (no need to delete it to go back to
 * "just the photo"), or stay entirely unset to fall back to the shared Heading/Description/Button
 * fields above the slide list (see HeroCarousel.tsx's own fallback-chain comment). Saved as one
 * PATCH on Save, not per-keystroke — same reasoning as SectionFormFields: a merchant reviewing a
 * whole caption shouldn't have every letter round-trip to the server. */
function SlideDetailPanel({
  slide,
  index,
  siteDetails,
  companyCode,
  setSiteDetails,
  markDraft,
  onBack,
}: {
  slide: HeroSlide;
  index: number;
  siteDetails: StorefrontSiteDetails;
  companyCode: string;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
  onBack: () => void;
}) {
  const [heading, setHeading] = useState(slide.heading ?? "");
  const [description, setDescription] = useState(slide.description ?? "");
  const [ctaText, setCtaText] = useState(slide.ctaText ?? "");
  const [ctaUrl, setCtaUrl] = useState(slide.ctaUrl ?? "");
  const [showHeading, setShowHeading] = useState(slide.showHeading !== false);
  const [showDescription, setShowDescription] = useState(slide.showDescription !== false);
  const [showCta, setShowCta] = useState(slide.showCta !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveSlideDetails(
        companyCode,
        siteDetails,
        index,
        { heading, description, ctaText, ctaUrl, showHeading, showDescription, showCta },
        setSiteDetails,
        markDraft
      );
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="slide-detail-panel">
      <button className="flex w-full cursor-pointer items-center gap-1.5 border-b border-sf-line px-4 py-3 text-left text-sm font-medium text-sf-ink hover:bg-sf-bg" onClick={onBack} type="button">
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Slide {index + 1}
      </button>

      <div className="space-y-5 px-4 py-4">
        <SlideTextField
          enabled={showHeading}
          label="Heading"
          onEnabledChange={setShowHeading}
          onValueChange={setHeading}
          placeholder={siteDetails.storeName}
          value={heading}
        />
        <SlideTextField
          enabled={showDescription}
          label="Description"
          multiline
          onEnabledChange={setShowDescription}
          onValueChange={setDescription}
          placeholder={siteDetails.aboutText || "Optional"}
          value={description}
        />
        <div className="space-y-2 border-t border-sf-line pt-4">
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Button</span>
            <span
              aria-checked={showCta}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${showCta ? "bg-emerald-600" : "bg-sf-line"}`}
              onClick={() => setShowCta((v) => !v)}
              role="switch"
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showCta ? "translate-x-[1.125rem]" : "translate-x-0.5"}`} />
            </span>
          </label>
          {showCta ? (
            <div className="space-y-2">
              <input
                className="w-full rounded-md border border-sf-line px-3 py-2 text-sm text-sf-ink"
                onChange={(e) => setCtaText(e.target.value)}
                placeholder={siteDetails.heroCtaText || "Shop now"}
                value={ctaText}
              />
              <input
                className="w-full rounded-md border border-sf-line px-3 py-2 text-sm text-sf-ink"
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder={siteDetails.heroCtaUrl || "#catalog"}
                value={ctaUrl}
              />
            </div>
          ) : null}
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          className="w-full cursor-pointer rounded-full bg-emerald-600 py-2 text-xs font-semibold text-white disabled:opacity-60"
          disabled={saving}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/** One labeled text field + its own show/hide toggle — the repeated shape behind Heading and
 * Description in SlideDetailPanel (the Button section has its own two-input layout, so it isn't
 * built from this). */
function SlideTextField({
  label,
  value,
  onValueChange,
  enabled,
  onEnabledChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">{label}</span>
        <span
          aria-checked={enabled}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-sf-line"}`}
          onClick={() => onEnabledChange(!enabled)}
          role="switch"
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-[1.125rem]" : "translate-x-0.5"}`} />
        </span>
      </label>
      {enabled ? (
        multiline ? (
          <textarea className="w-full resize-y rounded-md border border-sf-line px-3 py-2 text-sm text-sf-ink" onChange={(e) => onValueChange(e.target.value)} placeholder={placeholder} rows={3} value={value} />
        ) : (
          <input className="w-full rounded-md border border-sf-line px-3 py-2 text-sm text-sf-ink" onChange={(e) => onValueChange(e.target.value)} placeholder={placeholder} value={value} />
        )
      ) : null}
    </div>
  );
}
