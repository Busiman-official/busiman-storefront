export interface CartItem {
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  quantity: number;
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
