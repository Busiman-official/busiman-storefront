"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/components/templates/shared";

type ClientConfig =
  | { mock: true; note?: string }
  | { provider: "cashfree"; mode: "test" | "production"; paymentSessionId: string };

type PaymentMethod = "online" | "cod";

type Stage = { kind: "form" } | { kind: "processing" } | { kind: "success"; orderNumbers: string[]; orderStatusToken: string } | { kind: "error"; message: string };

declare global {
  interface Window {
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget: string }) => Promise<unknown>;
    };
  }
}

export function CheckoutBody({
  companyCode,
  accent,
  currency,
  codEnabled,
  codMaxOrderValue,
  codExtraFee,
  requiresPincode,
}: {
  companyCode: string;
  accent: string;
  currency: string;
  codEnabled: boolean;
  codMaxOrderValue?: number;
  codExtraFee: number;
  requiresPincode: boolean;
}) {
  const { items, totalAmount, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [stage, setStage] = useState<Stage>({ kind: "form" });

  const [deliveryEstimate, setDeliveryEstimate] = useState<number | null>(null);
  const [estimatingDelivery, setEstimatingDelivery] = useState(false);

  // Live delivery-charge preview — fires as soon as a valid 6-digit pincode is typed, debounced so
  // it doesn't fire on every keystroke. Read-only lookup, no checkout record created.
  useEffect(() => {
    if (!requiresPincode) return;
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setDeliveryEstimate(null);
      setEstimatingDelivery(false);
      return;
    }
    let cancelled = false;
    setEstimatingDelivery(true);
    const timer = setTimeout(() => {
      fetch(`/api/storefront/${companyCode}/delivery-estimate?pincode=${trimmed}&subtotal=${totalAmount}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          setDeliveryEstimate(json.success ? json.data.shippingFee : null);
        })
        .catch(() => {
          if (!cancelled) setDeliveryEstimate(null);
        })
        .finally(() => {
          if (!cancelled) setEstimatingDelivery(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pincode, requiresPincode, companyCode, totalAmount]);

  // A rough, client-side-only eligibility check (the real gate is server-side, re-checked against
  // the final amount including delivery) — just enough to decide whether COD is worth offering
  // before the shopper fills in the rest of the form.
  const codOverCap = codEnabled && codMaxOrderValue != null && totalAmount > codMaxOrderValue;
  const codAvailable = codEnabled && !codOverCap;

  const pincodeValid = !requiresPincode || /^\d{6}$/.test(pincode.trim());
  const canSubmit =
    name.trim().length > 0 && phone.trim().length >= 10 && address.trim().length > 0 && pincodeValid && items.length > 0;

  // Cashfree's own widget resolves this promise once the shopper's payment ATTEMPT finishes
  // (success or failure) — the result itself is never trusted; finalizeCheckout always asks the
  // server to independently verify with Cashfree before creating anything.
  async function openCashfreeCheckout(checkoutId: string, orderStatusToken: string, config: Extract<ClientConfig, { provider: "cashfree" }>) {
    if (!window.Cashfree) {
      setStage({ kind: "error", message: "Payment could not load — please refresh and try again" });
      return;
    }
    const cashfree = window.Cashfree({ mode: config.mode === "production" ? "production" : "sandbox" });
    await cashfree.checkout({ paymentSessionId: config.paymentSessionId, redirectTarget: "_modal" });
    await finalizeCheckout(checkoutId, orderStatusToken);
  }

  async function finalizeCheckout(checkoutId: string, orderStatusToken: string) {
    setStage({ kind: "processing" });
    try {
      const res = await fetch(`/api/storefront/${companyCode}/checkout/${checkoutId}/confirm`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setStage({ kind: "error", message: json?.error || "Payment could not be completed" });
        return;
      }
      clear();
      setStage({ kind: "success", orderNumbers: json.data.orderNumbers, orderStatusToken });
    } catch {
      setStage({ kind: "error", message: "Network error — please check your connection and try again" });
    }
  }

  async function startCheckout() {
    setStage({ kind: "processing" });
    try {
      const res = await fetch(`/api/storefront/${companyCode}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            address: address.trim(),
            pincode: requiresPincode ? pincode.trim() : undefined,
          },
          lines: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          paymentMethod: codAvailable ? paymentMethod : "online",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setStage({ kind: "error", message: json?.error || "Could not start checkout" });
        return;
      }
      if (json.data.paymentMethod === "cod") {
        clear();
        setStage({ kind: "success", orderNumbers: json.data.orderNumbers, orderStatusToken: json.data.orderStatusToken });
        return;
      }
      // Online payment — open the gateway immediately. No separate "awaiting payment" screen: one
      // click on "Continue to payment" goes straight to the gateway (Cashfree opens as a modal over
      // this same page, never a page navigation).
      const { checkoutId, orderStatusToken, clientConfig } = json.data as {
        checkoutId: string;
        orderStatusToken: string;
        clientConfig: ClientConfig;
      };
      if ("mock" in clientConfig) {
        await finalizeCheckout(checkoutId, orderStatusToken);
      } else {
        await openCashfreeCheckout(checkoutId, orderStatusToken, clientConfig);
      }
    } catch {
      setStage({ kind: "error", message: "Network error — please check your connection and try again" });
    }
  }

  if (items.length === 0 && stage.kind !== "success") {
    return (
      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-12 text-center">
        <p className="text-sm text-sf-ink-soft">Your cart is empty.</p>
        <Link className="text-sm font-medium underline" href={`/s/${companyCode}`}>
          Back to store
        </Link>
      </main>
    );
  }

  if (stage.kind === "success") {
    return (
      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-12 text-center">
        <h1 className="font-heading text-xl font-semibold text-sf-ink">Order placed</h1>
        <p className="text-sm text-sf-ink-soft">
          {stage.orderNumbers.length === 1
            ? `Your order ${stage.orderNumbers[0]} has been placed.`
            : `Your orders ${stage.orderNumbers.join(", ")} have been placed.`}
        </p>
        <div className="space-y-2">
          <Link className="block rounded-md px-4 py-2 text-sm font-semibold text-white" href={`/s/${companyCode}`} style={{ backgroundColor: accent }}>
            Continue shopping
          </Link>
          <Link className="block text-sm font-medium underline" href={`/s/${companyCode}/orders/${stage.orderStatusToken}`}>
            Track your order
          </Link>
        </div>
      </main>
    );
  }

  const showCodFee = paymentMethod === "cod" && codAvailable && codExtraFee > 0;
  const deliveryKnown = requiresPincode && deliveryEstimate != null;
  const formTotal = totalAmount + (showCodFee ? codExtraFee : 0) + (deliveryKnown ? deliveryEstimate! : 0);

  return (
    <main className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-8" id="section-page-content">
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      <h1 className="font-heading text-lg font-semibold text-sf-ink">Checkout</h1>

      <div className="space-y-1.5 rounded-lg border border-sf-line bg-sf-surface p-4 text-sm">
        <div className="flex items-center justify-between text-sf-ink-soft">
          <span>Subtotal</span>
          <span className="sf-price">{formatPrice(totalAmount, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-sf-ink-soft">
          <span>Delivery</span>
          <span className="sf-price">
            {requiresPincode
              ? deliveryKnown
                ? deliveryEstimate! > 0
                  ? formatPrice(deliveryEstimate!, currency)
                  : "Free"
                : estimatingDelivery
                  ? "Calculating…"
                  : "Enter your pincode"
              : "Calculated next step"}
          </span>
        </div>
        {showCodFee ? (
          <div className="flex items-center justify-between text-sf-ink-soft">
            <span>Cash on Delivery fee</span>
            <span className="sf-price">{formatPrice(codExtraFee, currency)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-sf-line pt-1.5 font-semibold text-sf-ink">
          <span>Total</span>
          <span className="sf-price">{formatPrice(formTotal, currency)}</span>
        </div>
      </div>

      {stage.kind === "error" ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{stage.message}</p>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void startCheckout();
        }}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-sf-ink-soft" htmlFor="name">
            Your name
          </label>
          <input
            className="w-full rounded-md border border-sf-line px-3 py-2 text-sm"
            id="name"
            onChange={(e) => setName(e.target.value)}
            required
            value={name}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-sf-ink-soft" htmlFor="phone">
            Phone number
          </label>
          <input
            className="w-full rounded-md border border-sf-line px-3 py-2 text-sm"
            id="phone"
            inputMode="tel"
            onChange={(e) => setPhone(e.target.value)}
            required
            value={phone}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-sf-ink-soft" htmlFor="address">
            Delivery address
          </label>
          <textarea
            className="w-full rounded-md border border-sf-line px-3 py-2 text-sm"
            id="address"
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House/flat, street, locality, city, pincode"
            required
            rows={3}
            value={address}
          />
        </div>
        {requiresPincode ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-sf-ink-soft" htmlFor="pincode">
              Delivery pincode
            </label>
            <input
              className="w-full rounded-md border border-sf-line px-3 py-2 text-sm"
              id="pincode"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit pincode"
              required
              value={pincode}
            />
            <p className="text-xs text-sf-ink-soft">Delivery charge is calculated from your pincode.</p>
          </div>
        ) : null}
        <div className="space-y-1">
          <label className="text-xs font-medium text-sf-ink-soft" htmlFor="email">
            Email (optional)
          </label>
          <input
            className="w-full rounded-md border border-sf-line px-3 py-2 text-sm"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            value={email}
          />
        </div>

        {codEnabled ? (
          <div className="space-y-2">
            <span className="text-xs font-medium text-sf-ink-soft">Payment method</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="cursor-pointer rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors"
                onClick={() => setPaymentMethod("online")}
                style={
                  paymentMethod === "online"
                    ? { borderColor: accent, color: accent, backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)` }
                    : { borderColor: "var(--sf-line)", color: "var(--sf-ink)" }
                }
                type="button"
              >
                Pay online
              </button>
              <button
                className="cursor-pointer rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!codAvailable}
                onClick={() => setPaymentMethod("cod")}
                style={
                  paymentMethod === "cod" && codAvailable
                    ? { borderColor: accent, color: accent, backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)` }
                    : { borderColor: "var(--sf-line)", color: "var(--sf-ink)" }
                }
                type="button"
              >
                Pay on Delivery
              </button>
            </div>
            {codOverCap ? (
              <p className="text-xs text-sf-ink-soft">
                Cash on Delivery is available for orders up to {formatPrice(codMaxOrderValue!, currency)}.
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          className="w-full rounded-md py-3 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!canSubmit || stage.kind === "processing"}
          style={{ backgroundColor: accent }}
          type="submit"
        >
          {stage.kind === "processing" ? "Please wait…" : paymentMethod === "cod" && codAvailable ? "Place order" : "Continue to payment"}
        </button>
      </form>
    </main>
  );
}
