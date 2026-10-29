"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { cartLineKey } from "@/lib/cart";
import { formatPrice } from "@/components/templates/shared";

export function CartBody({ companyCode, accent, currency }: { companyCode: string; accent: string; currency: string }) {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();

  // A line added earlier can have sold out by the time the shopper reaches the cart — checkout
  // itself already re-checks stock (finalizeOrders), but only after the whole form is filled in.
  // This re-check happens right here instead, so a sold-out item is caught before that point.
  const [soldOutKeys, setSoldOutKeys] = useState<Set<string>>(new Set());
  const [checkedStock, setCheckedStock] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setCheckedStock(false);
    fetch(`/api/storefront/${companyCode}/stock-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: items.map((i) => ({ slug: i.slug, variantId: i.variantId })) }),
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const sold = new Set<string>();
        for (const row of json.data as Array<{ slug: string; variantId?: string; inStock: boolean }>) {
          if (!row.inStock) sold.add(cartLineKey({ slug: row.slug, variantId: row.variantId }));
        }
        setSoldOutKeys(sold);
      })
      .catch(() => {
        // Network hiccup — never block checkout over this check failing; the server-side
        // finalizeOrders re-check is still the authoritative last line of defense.
      })
      .finally(() => {
        if (!cancelled) setCheckedStock(true);
      });
    return () => {
      cancelled = true;
    };
    // Re-run whenever the cart's composition changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyCode, items.map((i) => cartLineKey(i)).join(",")]);

  const hasSoldOut = checkedStock && soldOutKeys.size > 0;

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
            {items.map((item) => {
              const soldOut = soldOutKeys.has(cartLineKey(item));
              return (
              <li className={`flex items-center gap-3 p-3 ${soldOut ? "opacity-60" : ""}`} key={cartLineKey(item)}>
                <Link className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-sf-bg" href={`/s/${companyCode}/products/${item.slug}`}>
                  {item.image ? <Image alt={item.name} className="object-cover" fill sizes="64px" src={item.image} /> : null}
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link className="truncate text-sm font-medium text-sf-ink hover:underline" href={`/s/${companyCode}/products/${item.slug}`}>
                    {item.name}
                  </Link>
                  {item.variantName ? <p className="truncate text-xs text-sf-ink-soft">{item.variantName}</p> : null}
                  {soldOut ? (
                    <p className="text-xs font-medium text-red-600">Out of stock — remove to continue</p>
                  ) : (
                    <p className="sf-price text-xs text-sf-ink-soft">{formatPrice(item.price, currency)} each</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded border border-sf-line text-sm"
                      onClick={() => updateQuantity(item.slug, item.variantId, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span className="sf-price w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded border border-sf-line text-sm"
                      onClick={() => updateQuantity(item.slug, item.variantId, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="ml-2 text-xs text-sf-ink-soft underline"
                      onClick={() => removeItem(item.slug, item.variantId)}
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
              );
            })}
          </ul>

          <div className="flex items-center justify-between border-t border-sf-line pt-4">
            <span className="text-sm text-sf-ink-soft">Total</span>
            <span className="sf-price text-lg font-semibold text-sf-ink">{formatPrice(totalAmount, currency)}</span>
          </div>

          {hasSoldOut ? (
            <>
              <p className="text-center text-sm text-red-600">
                Remove the out-of-stock item{soldOutKeys.size > 1 ? "s" : ""} above to continue.
              </p>
              <button
                className="block w-full cursor-not-allowed rounded-md bg-sf-line py-3 text-center text-sm font-semibold text-sf-ink-soft"
                disabled
                type="button"
              >
                Proceed to checkout
              </button>
            </>
          ) : (
            <Link
              className="block w-full rounded-md py-3 text-center text-sm font-semibold text-white"
              href={`/s/${companyCode}/checkout`}
              style={{ backgroundColor: accent }}
            >
              Proceed to checkout
            </Link>
          )}
        </>
      )}
    </main>
  );
}
