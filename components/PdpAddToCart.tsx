"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

export function PdpAddToCart({
  slug,
  name,
  price,
  image,
  accent,
  inStock,
  notAvailableOnline = false,
  maxQuantity = null,
  companyCode,
  variantId,
  variantName,
}: {
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  accent: string;
  inStock: boolean;
  /** Product can never be bought online — the buttons say "Not available online", not "Out of stock". */
  notAvailableOnline?: boolean;
  /** Most units allowed at once (null = no limit). Comes from the server for stock-tracked products. */
  maxQuantity?: number | null;
  /** For the "Buy Now" button's jump straight to checkout. */
  companyCode: string;
  /** The shopper's selected variant, when the product has more than one. */
  variantId?: string;
  variantName?: string;
}) {
  const { addItem, buyNow } = useCart();
  const router = useRouter();
  const [wanted, setWanted] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  if (price == null) return null;

  // Never let the shopper ask for more than the store can supply; if they switch to an option with
  // fewer units, the shown quantity follows it down.
  const cap = maxQuantity != null && maxQuantity > 0 ? maxQuantity : null;
  const quantity = cap != null ? Math.min(wanted, cap) : wanted;
  const setQuantity = (update: (q: number) => number) => setWanted(update(quantity));
  const atMax = cap != null && quantity >= cap;
  const unavailableLabel = notAvailableOnline ? "Not available online" : "Out of stock";

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-2">
        <div className="flex flex-none items-center rounded-full border border-sf-line">
          <button
            aria-label="Decrease quantity"
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-base text-sf-ink transition-colors hover:text-sf-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            type="button"
          >
            −
          </button>
          <span className="sf-price w-6 text-center text-sm font-semibold text-sf-ink">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-base text-sf-ink transition-colors hover:text-sf-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            disabled={atMax}
            onClick={() => setQuantity((q) => q + 1)}
            type="button"
          >
            +
          </button>
        </div>
        <button
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!inStock}
          onClick={() => {
            addItem({ slug, name, price, image, variantId, variantName }, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
          style={{ borderColor: accent, color: accent }}
          type="button"
        >
          {added ? (
            <svg aria-hidden="true" className="flex-none" fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="flex-none" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
          )}
          <span className="truncate">{!inStock ? unavailableLabel : added ? "Added" : "Add to cart"}</span>
        </button>
      </div>
      <button
        className="w-full cursor-pointer rounded-full py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!inStock || buying}
        onClick={() => {
          buyNow({ slug, name, price, image, variantId, variantName }, quantity);
          setBuying(true);
          router.push(`/s/${companyCode}/checkout`);
        }}
        style={{ backgroundColor: accent }}
        type="button"
      >
        {!inStock ? unavailableLabel : buying ? "Taking you to checkout…" : "Buy now"}
      </button>
      {inStock && atMax ? (
        <p className="text-center text-xs text-sf-ink-soft">That is the most you can order right now.</p>
      ) : null}
    </div>
  );
}
