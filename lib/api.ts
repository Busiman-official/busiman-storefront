/**
 * Public Storefront API client — talks to the main Express server's /api/v1/storefront routes.
 * Server-side fetch only (Server Components). Deliberately `cache: "no-store"` — ONE cache layer
 * (the server's own in-memory cache, storefrontCache.ts) rather than two uncoordinated ones. An
 * earlier version also cached here via `next: { revalidate: 60 }`, which meant an admin's publish
 * toggle busted the server's cache instantly but this layer kept serving its own stale copy for up
 * to 60s regardless — a real bug (re-enabling a product didn't reappear on the live site). The
 * server's cache already gives the caching benefit ADR-004 asks for, with correct bust-on-publish
 * semantics; this layer doesn't need to duplicate it.
 */

export interface StorefrontSiteDetails {
  storeName: string;
  logoUrl?: string;
  aboutText?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  accentColor: string;
  currency: string;
  shippingFlatRate?: number;
  freeShippingThreshold?: number;
  announcementText?: string;
  codEnabled?: boolean;
  codMaxOrderValue?: number;
  codExtraFee?: number;
  deliveryMode?: "flat" | "banded";
  deliveryBands?: Array<{ upToKm: number; charge: number }>;
  trustStripEnabled?: boolean;
  categoryRailEnabled?: boolean;
  announcementEnabled?: boolean;
  navbarStyle?: "classic";
  heroStyle?: "classic" | "carousel";
  categoryRailStyle?: "circles";
  heroCtaText?: string;
  heroCtaUrl?: string;
  heroBackgroundImage?: string;
  heroImagePositionX?: number;
  heroImagePositionY?: number;
  heroSlides?: Array<{
    image: string;
    positionX?: number;
    positionY?: number;
    heading?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    showHeading?: boolean;
    showDescription?: boolean;
    showCta?: boolean;
  }>;
  heroAutoplayMs?: number;
}

export type StorefrontTemplateId = "classic" | "modern" | "minimal";

export interface StorefrontPolicies {
  shipping?: string;
  returns?: string;
  terms?: string;
  privacy?: string;
}

export interface StorefrontSite {
  companyCode: string;
  templateId: StorefrontTemplateId;
  siteDetails: StorefrontSiteDetails;
  policies?: StorefrontPolicies;
  policyDefaults?: Required<StorefrontPolicies>;
}

export type CatalogSort = "name" | "price_asc" | "price_desc";

export type StorefrontBadge = "new" | "bestseller" | "sale";

export interface StorefrontProduct {
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  /** The "original" price, struck through on the card — only ever present alongside
   * discountPercent, when it's genuinely higher than price. */
  mrp?: number | null;
  /** Computed server-side from mrp vs price, never stored — null means no real markdown. */
  discountPercent?: number | null;
  badge?: StorefrontBadge | null;
  image: string | null;
  category?: string | null;
  inStock: boolean;
  /** True only when this product has 2+ priced variants — the card should show "From ₹{price}"
   * instead of a plain "₹{price}" (price is already the cheapest variant's price). */
  isFromPrice?: boolean;
}

export interface StorefrontCatalogPage {
  items: StorefrontProduct[];
  page: number;
  hasMore: boolean;
}

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("SERVICE_API_BASE_URL is not configured");
  }
  return base;
}

export async function fetchSiteConfig(companyCode: string): Promise<StorefrontSite | null> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/site`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export async function fetchCategories(companyCode: string): Promise<string[]> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/categories`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data ?? [];
}

export async function fetchCatalog(
  companyCode: string,
  page = 1,
  options?: { category?: string; sort?: CatalogSort },
): Promise<StorefrontCatalogPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (options?.category) params.set("category", options.category);
  if (options?.sort) params.set("sort", options.sort);
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/products?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!res.ok) return { items: [], page, hasMore: false };
  const json = await res.json();
  return json?.data ?? { items: [], page, hasMore: false };
}

export interface StorefrontMediaItem {
  url: string;
  type: "image" | "video";
}

export interface StorefrontProductVariant {
  variantId: string;
  name: string;
  isDefault: boolean;
  price: number | null;
  mrp: number | null;
  discountPercent: number | null;
  badge: StorefrontBadge | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Per-variant override of the item's spec table/about copy — already resolved server-side to
   * fall back to the item's own when the variant hasn't set its own. */
  specs: Array<{ label: string; value: string }>;
  about: string;
  media: StorefrontMediaItem[];
  inStock: boolean;
}

export interface StorefrontProductDetail {
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  mrp?: number | null;
  discountPercent?: number | null;
  badge?: StorefrontBadge | null;
  media: StorefrontMediaItem[];
  seoTitle: string | null;
  seoDescription: string | null;
  inStock: boolean;
  /** Every publicly-visible, active variant — one entry for a single-variant product (same values
   * as the top-level fields above, which mirror the default variant). */
  variants: StorefrontProductVariant[];
  /** Amazon-style "Product details" spec table — item-level (shared across variants), empty when
   * the merchant hasn't filled any in. */
  specs: Array<{ label: string; value: string }>;
  /** Rich "About this product" copy (Markdown) — shown above the specs table, rendered through
   * MarkdownContent. Empty string when the merchant hasn't written one. */
  about: string;
  /** "Products you might like" — same-category products first, topped up with the rest of the
   * live catalog. Up to 8, excludes this product itself. */
  related: StorefrontProduct[];
}

export async function fetchProduct(companyCode: string, slug: string): Promise<StorefrontProductDetail | null> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/products/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export interface StorefrontSearchResult {
  items: StorefrontProduct[];
  page: number;
  hasMore: boolean;
  query: string;
  priceBounds: { min: number | null; max: number | null };
}

export interface SearchFilterOptions {
  category?: string;
  sort?: CatalogSort;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export async function fetchSearch(
  companyCode: string,
  query: string,
  page = 1,
  options?: SearchFilterOptions,
): Promise<StorefrontSearchResult> {
  const empty: StorefrontSearchResult = { items: [], page, hasMore: false, query, priceBounds: { min: null, max: null } };
  const params = new URLSearchParams({ q: query, page: String(page) });
  if (options?.category) params.set("category", options.category);
  if (options?.sort) params.set("sort", options.sort);
  if (options?.inStockOnly) params.set("inStockOnly", "true");
  if (options?.minPrice != null) params.set("minPrice", String(options.minPrice));
  if (options?.maxPrice != null) params.set("maxPrice", String(options.maxPrice));

  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/search?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!res.ok) return empty;
  const json = await res.json();
  return json?.data ?? empty;
}

export interface OrderShipment {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
}

export interface OrderStatus {
  status: "pending" | "paid" | "failed";
  failureReason: string | null;
  subtotal: number;
  shippingFee: number;
  paymentMethod: "online" | "cod";
  codExtraFee: number;
  amount: number;
  currency: string;
  createdAt: string;
  orderNumbers: string[];
  shipment: OrderShipment;
}

export async function fetchOrderStatus(companyCode: string, token: string): Promise<OrderStatus | null> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/orders/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

/** True only when the session cookie's token is validly signed, unexpired, AND was issued for
 * this exact companyCode — see storefront-admin.service.ts. Called server-side (admin/page.tsx)
 * on every load; never cached, since a session can be invalidated at any time. */
export async function verifyStorefrontAdminSession(companyCode: string, token: string): Promise<boolean> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/session?token=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  return res.ok;
}

export interface StorefrontAdminDraft {
  templateId: StorefrontTemplateId;
  siteDetails: StorefrontSiteDetails;
  policies: StorefrontPolicies;
  policyDefaults: Required<StorefrontPolicies>;
  hasDraft: boolean;
}

/** Server-side-only fetch (admin/page.tsx) of the editor's working copy — seeded from the live
 * fields on the first load of a draft cycle, see storefront-admin.service.ts's getDraft. */
export async function fetchStorefrontAdminDraft(companyCode: string, token: string): Promise<StorefrontAdminDraft | null> {
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/draft?token=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}
