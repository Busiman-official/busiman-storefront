"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatPrice } from "./templates/shared";

export function CartBadge({ companyCode, currency = "INR" }: { companyCode: string; currency?: string }) {
  const { items, totalCount, totalAmount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label={`Cart, ${totalCount} item${totalCount === 1 ? "" : "s"}`}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-sf-line text-sf-ink transition-colors hover:border-sf-ink-soft"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
          <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
        </svg>
        {totalCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sf-ink px-1 text-[10px] font-semibold text-white">
            {totalCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            aria-label="Close cart preview"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <div className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-sf-line bg-sf-surface p-3 shadow-lg">
            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-sf-ink-soft">Your cart is empty.</p>
            ) : (
              <>
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {items.map((item) => (
                    <li className="flex items-center gap-2" key={item.slug}>
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-sf-bg">
                        {item.image ? <Image alt={item.name} className="object-cover" fill sizes="40px" src={item.image} /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-sf-ink">{item.name}</p>
                        <p className="sf-price text-xs text-sf-ink-soft">
                          {item.quantity} × {formatPrice(item.price, currency)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-sf-line pt-2 text-sm font-semibold text-sf-ink">
                  <span>Total</span>
                  <span className="sf-price">{formatPrice(totalAmount, currency)}</span>
                </div>
                <Link
                  className="mt-2 block cursor-pointer rounded-full bg-sf-ink py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  href={`/s/${companyCode}/checkout`}
                  onClick={() => setOpen(false)}
                >
                  Checkout
                </Link>
              </>
            )}
            <Link
              className="mt-2 block cursor-pointer text-center text-xs text-sf-ink-soft underline-offset-2 hover:underline"
              href={`/s/${companyCode}/cart`}
              onClick={() => setOpen(false)}
            >
              View cart
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
