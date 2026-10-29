export interface CartItem {
  slug: string;
  /** The shopper's chosen variant. Undefined means "no choice made" (product has only one variant,
   * or was added before variant selection existed) — the server falls back to the item's default
   * variant in that case. A line is uniquely identified by slug+variantId, NOT slug alone: the
   * same product in two different variants are two separate lines, never merged. */
  variantId?: string;
  /** Shown as a line subtitle only when it's a non-default/meaningfully distinct variant name —
   * callers decide whether to display it; stored here so the cart page doesn't need a product
   * lookup just to show which variant is in the cart. */
  variantName?: string;
  name: string;
  price: number | null;
  image: string | null;
  quantity: number;
}

/** A cart line's identity for matching/merging purposes — see CartItem's own comment on why
 * variantId is part of the key. */
export function cartLineKey(item: Pick<CartItem, "slug" | "variantId">): string {
  return `${item.slug}::${item.variantId ?? ""}`;
}

export interface CartState {
  items: CartItem[];
}

function storageKey(companyCode: string): string {
  return `busiman-storefront-cart:${companyCode}`;
}

export function readCart(companyCode: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(companyCode));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(companyCode: string, items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(companyCode), JSON.stringify(items));
  } catch {
    // Private browsing / storage disabled — the cart just won't persist across reloads, not fatal.
  }
}

export function clearCart(companyCode: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(companyCode));
  } catch {
    // ignore
  }
}
