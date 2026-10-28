"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/components/templates/shared";

export function CartBody({ companyCode, accent, currency }: { companyCode: string; accent: string; currency: string }) {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8" id="section-page-content">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-sf-ink">Your cart</h1>
        <Link className="text-sm text-sf-ink-soft underline" href={`/s/${companyCode}`}>
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-sf-line bg-sf-surface p-8 text-center text-sm text-sf-ink-soft">
          Your cart is empty.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-sf-line rounded-lg border border-sf-line bg-sf-surface">
            {items.map((item) => (
              <li className="flex items-center gap-3 p-3" key={item.slug}>
                <Link className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-sf-bg" href={`/s/${companyCode}/products/${item.slug}`}>
                  {item.image ? <Image alt={item.name} className="object-cover" fill sizes="64px" src={item.image} /> : null}
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link className="truncate text-sm font-medium text-sf-ink hover:underline" href={`/s/${companyCode}/products/${item.slug}`}>
                    {item.name}
                  </Link>
                  <p className="sf-price text-xs text-sf-ink-soft">{formatPrice(item.price, currency)} each</p>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded border border-sf-line text-sm"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span className="sf-price w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded border border-sf-line text-sm"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="ml-2 text-xs text-sf-ink-soft underline"
                      onClick={() => removeItem(item.slug)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="sf-price shrink-0 text-sm font-semibold text-sf-ink">
                  {formatPrice((item.price ?? 0) * item.quantity, currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-sf-line pt-4">
            <span className="text-sm text-sf-ink-soft">Total</span>
            <span className="sf-price text-lg font-semibold text-sf-ink">{formatPrice(totalAmount, currency)}</span>
          </div>

          <Link
            className="block w-full rounded-md py-3 text-center text-sm font-semibold text-white"
            href={`/s/${companyCode}/checkout`}
            style={{ backgroundColor: accent }}
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </main>
  );
}
