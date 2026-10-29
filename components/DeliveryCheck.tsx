"use client";

/**
 * "Check delivery to your area" — the same pincode -> shipping-fee lookup CheckoutBody.tsx already
 * does at the cart stage, surfaced earlier on the product page itself (an Amazon-familiar pattern)
 * so a shopper can see whether/what delivery costs before they've even added anything to cart.
 * `subtotal` is the product's own price (qty 1) — a preview, not a committed quote; the real
 * quote at checkout accounts for the whole cart.
 */
import { useState, type FormEvent } from "react";

export function DeliveryCheck({ companyCode, subtotal, currency }: { companyCode: string; subtotal: number; currency: string }) {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "error" } | { status: "done"; fee: number }>({ status: "idle" });

  async function check(e: FormEvent) {
    e.preventDefault();
    if (pincode.length !== 6) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/delivery-estimate?pincode=${pincode}&subtotal=${subtotal}`);
      const json = await res.json();
      if (!res.ok || typeof json?.data?.shippingFee !== "number") throw new Error("failed");
      setState({ status: "done", fee: json.data.shippingFee });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <div className="space-y-1.5">
      <form className="flex gap-2" onSubmit={check}>
        <input
          aria-label="Delivery pincode"
          className="min-w-0 flex-1 rounded-md border border-sf-line bg-sf-bg px-3 py-2 text-sm text-sf-ink outline-none focus:border-sf-ink-soft"
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setState({ status: "idle" });
          }}
          placeholder="Enter pincode"
          value={pincode}
        />
        <button
          className="flex-none cursor-pointer rounded-md border border-sf-line px-3 text-sm font-medium text-sf-ink transition-colors hover:bg-sf-bg disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pincode.length !== 6 || state.status === "loading"}
          type="submit"
        >
          {state.status === "loading" ? "Checking…" : "Check"}
        </button>
      </form>
      {state.status === "done" ? (
        <p className="text-xs text-sf-ink-soft">
          {state.fee > 0 ? (
            <>
              Delivery to {pincode}:{" "}
              <span className="font-medium text-sf-ink">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(state.fee)}
              </span>
            </>
          ) : (
            <span className="font-medium text-green-700">Free delivery to {pincode}</span>
          )}
        </p>
      ) : null}
      {state.status === "error" ? <p className="text-xs text-red-600">Couldn&apos;t check that pincode — try again.</p> : null}
    </div>
  );
}
