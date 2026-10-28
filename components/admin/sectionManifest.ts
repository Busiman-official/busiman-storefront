/**
 * Declares, per admin page, which sections the left sidebar lists and what each one can do —
 * deliberately static config, not a dynamic/reorderable model (see the epic plan: drag-to-reorder
 * and new section types are both explicitly deferred). A section with no `toggleField` is always
 * shown and exists in this list purely for navigation (click to jump the preview to it); a section
 * with no `designs` has nothing to pick beyond its one existing look.
 */
import type { StorefrontSiteDetails } from "@/lib/api";

export type SectionToggleField = "trustStripEnabled" | "categoryRailEnabled" | "announcementEnabled";
export type SectionStyleField = "navbarStyle" | "heroStyle" | "categoryRailStyle";
/** Plain siteDetails text fields a section's panel can expose as an inline form — distinct from
 * SectionToggleField/SectionStyleField, which each have their own dedicated save path/UI. */
export type SectionTextField = "storeName" | "aboutText" | "heroCtaText" | "heroCtaUrl";
/** Image fields an admin section can upload directly — each pairs the siteDetails field it saves
 * into with the Express upload route that stores it (see uploadAndSaveImage in AdminShell.tsx). */
export type SectionImageField = "logoUrl" | "heroBackgroundImage";

export interface SectionDesign {
  id: string;
  label: string;
}

export interface SectionFormField {
  key: SectionTextField;
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

export interface SectionImageSetting {
  field: SectionImageField;
  label: string;
  uploadPath: "upload-logo" | "upload-hero-image";
  /** Whether this image gets the drag-anywhere focal-point picker — true for Hero's background
   * (a full-bleed, object-cover photo where framing matters), false/unset for the logo (shown
   * small and whole, never cropped, so there's nothing to position). */
  supportsPosition?: boolean;
}

export interface SectionManifestEntry {
  key: string;
  label: string;
  /** The `id` attribute on that section's wrapping element in the live preview, for scroll+highlight. */
  domId: string;
  toggleField?: SectionToggleField;
  styleField?: SectionStyleField;
  designs?: SectionDesign[];
  /** Image uploads this section's panel exposes — Navbar's logo, Hero's background photo. */
  images?: SectionImageSetting[];
  /** Text content this section's panel lets the merchant edit directly as a form, in addition to
   * (not instead of, where both exist) clicking the text in the live preview — e.g. Hero's heading
   * and description are both click-to-edit in the preview AND listed here; heroCtaText/heroCtaUrl
   * are form-only, since heroCtaText is the label inside a real `<a>` — wrapping it in the same
   * click-to-edit affordance used elsewhere would fight the link's own click — and heroCtaUrl has no
   * visible text in the preview to click at all. */
  formFields?: SectionFormField[];
}

export const CLASSIC_HOME_SECTIONS: SectionManifestEntry[] = [
  {
    key: "navbar",
    label: "Navbar",
    domId: "section-navbar",
    styleField: "navbarStyle",
    designs: [{ id: "classic", label: "Classic" }],
    images: [{ field: "logoUrl", label: "Logo", uploadPath: "upload-logo" }],
  },
  { key: "announcement", label: "Announcement banner", domId: "section-announcement", toggleField: "announcementEnabled" },
  {
    key: "hero",
    label: "Hero",
    domId: "section-hero",
    styleField: "heroStyle",
    designs: [
      { id: "classic", label: "Classic" },
      { id: "carousel", label: "Carousel" },
    ],
    images: [{ field: "heroBackgroundImage", label: "Background image", uploadPath: "upload-hero-image", supportsPosition: true }],
    formFields: [
      { key: "storeName", label: "Heading" },
      { key: "aboutText", label: "Description", multiline: true, placeholder: "Tell shoppers what makes your store worth buying from" },
      { key: "heroCtaText", label: "Button text", placeholder: "Shop now" },
      { key: "heroCtaUrl", label: "Button link", placeholder: "#catalog" },
    ],
  },
  { key: "trustStrip", label: "Trust strip", domId: "section-trust-strip", toggleField: "trustStripEnabled" },
  {
    key: "categoryRail",
    label: "Category rail",
    domId: "section-category-rail",
    toggleField: "categoryRailEnabled",
    styleField: "categoryRailStyle",
    designs: [{ id: "circles", label: "Circles" }],
  },
  { key: "products", label: "Products", domId: "section-products" },
  { key: "footer", label: "Footer", domId: "section-footer" },
];

/** Modern/Minimal have no trust strip, category rail, or announcement-banner concept yet (see the
 * epic plan's research — this is a real, honest gap, not an oversight), and neither one separates
 * navbar from hero the way Classic does (Modern's header IS its hero; Minimal's header has no hero
 * at all) — listing them as separate rows would point two clicks at the same place. */
export const GENERIC_HOME_SECTIONS: SectionManifestEntry[] = [
  { key: "header", label: "Header", domId: "section-navbar" },
  { key: "products", label: "Products", domId: "section-products" },
  { key: "footer", label: "Footer", domId: "section-footer" },
];

/** Every non-home admin page (product detail, about, policies, cart, checkout, search, orders) —
 * navigation-only, same three-part shape every one of those pages actually has. */
export const GENERIC_PAGE_SECTIONS: SectionManifestEntry[] = [
  { key: "navbar", label: "Navbar", domId: "section-navbar" },
  { key: "content", label: "Page content", domId: "section-page-content" },
  { key: "footer", label: "Footer", domId: "section-footer" },
];

export function sectionsForHome(templateId: "classic" | "modern" | "minimal"): SectionManifestEntry[] {
  return templateId === "classic" ? CLASSIC_HOME_SECTIONS : GENERIC_HOME_SECTIONS;
}

/** Whether a section is currently "on" — undefined always means on (see each field's own model
 * comment), matching every toggle's established convention. */
export function isSectionVisible(entry: SectionManifestEntry, siteDetails: StorefrontSiteDetails): boolean {
  if (!entry.toggleField) return true;
  return siteDetails[entry.toggleField] !== false;
}
