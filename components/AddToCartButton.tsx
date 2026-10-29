"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import type { StorefrontProduct } from "@/lib/api";

export function AddToCartButton({ product, accent, companyCode }: { product: StorefrontProduct; accent: string; companyCode: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!product.inStock) {
    return (
      <button className="w-full cursor-not-allowed rounded-full bg-sf-line py-2 text-xs font-semibold text-sf-ink-soft" disabled type="button">
        Out of stock
      </button>
    );
  }

  // A "from ₹X" card has 2+ variants at different prices — product.price here is just the
  // cheapest one. Adding straight from the grid would add that cheapest price with no variantId
  // at all, so the cart/checkout would have no record of which variant was actually meant (see
  // reports/Busiman ecommerce department audit.md's BUGS list). Send the shopper to the PDP's own
  // variant picker instead, same as every real multi-variant storefront does for a catalog card.
  if (product.isFromPrice) {
    return (
      <Link
        className="flex w-full items-center justify-center rounded-full py-2 text-xs font-semibold text-white transition-[filter] duration-200 hover:brightness-110 active:brightness-95"
        href={`/s/${companyCode}/products/${product.slug}`}
        style={{ backgroundColor: accent }}
      >
        Select options
      </Link>
    );
  }

  return (
    <button
      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-white transition-[filter,opacity] duration-200 hover:brightness-110 active:brightness-95"
      onClick={() => {
        addItem({ slug: product.slug, name: product.name, price: product.price, image: product.image });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      style={{ backgroundColor: accent, opacity: added ? 0.85 : 1 }}
      type="button"
    >
      {added ? (
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
        </svg>
      )}
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
