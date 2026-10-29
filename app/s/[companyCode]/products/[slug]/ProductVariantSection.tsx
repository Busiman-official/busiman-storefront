"use client";

/**
 * Owns variant selection for the PDP and lays out the page in the familiar three-region pattern
 * (image gallery / scrollable details / sticky buy box) — wraps the gallery, title/badge/stock,
 * description, specs table, variant picker, and PdpAddToCart so all of them react together when a
 * shopper picks a different variant. Only ever shows the picker itself when the product has 2+
 * variants (the common case is one variant, where this renders identically to a plain PDP).
 */
import { useState } from "react";
import { formatPrice } from "@/components/templates/shared";
import { DeliveryCheck } from "@/components/DeliveryCheck";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PdpAddToCart } from "@/components/PdpAddToCart";
import type { StorefrontProductDetail, StorefrontProductVariant } from "@/lib/api";
import { ProductGallery } from "./ProductGallery";

function badgeLabel(badge: StorefrontProductVariant["badge"]): string {
  return badge === "new" ? "New" : badge === "bestseller" ? "Bestseller" : "Sale";
}

function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label="Share this product"
      className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full border border-sf-line text-sf-ink-soft transition-colors hover:text-sf-ink"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: name, url }).catch(() => {});
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard permission denied — no feedback to show, nothing left to fall back to.
        }
      }}
      title={copied ? "Link copied" : "Share"}
      type="button"
    >
      {copied ? (
        <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="15">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="15">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.7 7.6-4.4M8.2 13.3l7.6 4.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export function ProductVariantSection({
  companyCode,
  product,
  accent,
  currency,
}: {
  companyCode: string;
  product: StorefrontProductDetail;
  accent: string;
  currency: string;
}) {
  const variants = product.variants;
  const hasChoice = variants.length > 1;
  const [selectedId, setSelectedId] = useState(() => variants.find((v) => v.isDefault)?.variantId ?? variants[0]?.variantId);
  const selected = variants.find((v) => v.variantId === selectedId) ?? variants[0];

  // Falls back to the top-level product fields when there's no variant data at all (shouldn't
  // happen once this feature is live, but keeps the page from breaking on stale/odd data).
  const price = selected?.price ?? product.price;
  const mrp = selected?.mrp ?? product.mrp;
  const discountPercent = selected?.discountPercent ?? product.discountPercent;
  const badge = selected?.badge ?? product.badge;
  const inStock = selected?.inStock ?? product.inStock;
  const media = selected?.media ?? product.media;
  const about = selected?.about ?? product.about;
  const specs = selected?.specs ?? product.specs;

  return (
    // Below lg: a single stacked column (gallery, then details, then the buy box as a normal
    // block at the end). At lg+: Amazon's three-region grid — a fixed-width gallery column, a
    // flexible scrollable details column, and a fixed-width buy box that sticks as the page
    // scrolls (the details column is usually the only one long enough to scroll past it).
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr_240px] lg:items-start xl:grid-cols-[minmax(0,420px)_1fr_260px]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductGallery alt={product.name} key={selected?.variantId ?? "default"} media={media} />
      </div>

      <div className="min-w-0 space-y-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-xl font-semibold text-sf-ink sm:text-2xl">{product.name}</h1>
            <ShareButton name={product.name} />
          </div>
          {badge ? (
            <span
              className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                badge === "new" ? "bg-blue-600 text-white" : badge === "bestseller" ? "bg-amber-400 text-amber-950" : "bg-red-600 text-white"
              }`}
            >
              {badgeLabel(badge)}
            </span>
          ) : null}
        </div>

        {/* Price repeats here (also shown in the buy box) — on a scrollable details column,
            the buy box's price can scroll out of view on a long description, so a shopper
            reading mid-page still has the number in front of them. */}
        {price != null ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 lg:hidden">
            <p className="sf-price text-xl font-semibold" style={{ color: accent }}>
              {formatPrice(price, currency)}
            </p>
            {discountPercent != null && mrp != null ? (
              <>
                <p className="text-sm text-sf-ink-soft line-through">{formatPrice(mrp, currency)}</p>
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">{discountPercent}% OFF</span>
              </>
            ) : null}
          </div>
        ) : null}

        {hasChoice ? (
          <div className="space-y-2" role="group" aria-label="Choose an option">
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const isSelected = v.variantId === selected?.variantId;
                return (
                  <button
                    aria-pressed={isSelected}
                    className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!v.inStock}
                    key={v.variantId}
                    onClick={() => setSelectedId(v.variantId)}
                    style={
                      isSelected
                        ? { borderColor: accent, color: accent, backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)` }
                        : { borderColor: "var(--sf-line)", color: "var(--sf-ink)" }
                    }
                    type="button"
                  >
                    {v.name}
                    {!v.inStock ? " — Out of stock" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {about ? (
          <section aria-labelledby="about-heading">
            <h2 className="font-heading text-sm font-semibold text-sf-ink" id="about-heading">
              About this product
            </h2>
            <MarkdownContent className="mt-2 text-sm text-sf-ink-soft" text={about} />
          </section>
        ) : product.description ? (
          <p className="whitespace-pre-line text-sm text-sf-ink-soft">{product.description}</p>
        ) : null}

        {specs.length > 0 ? (
          <section aria-labelledby="product-details-heading">
            <h2 className="font-heading text-sm font-semibold text-sf-ink" id="product-details-heading">
              Product details
            </h2>
            <dl className="mt-3 divide-y divide-sf-line overflow-hidden rounded-lg border border-sf-line bg-sf-surface">
              {specs.map((spec, i) => (
                <div className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 px-4 py-2.5 text-sm" key={`${spec.label}-${i}`}>
                  <dt className="text-sf-ink-soft">{spec.label}</dt>
                  <dd className="font-medium text-sf-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* Buy box repeats inline below lg (no sticky sidebar on a narrow screen to stick to). */}
        <div className="space-y-4 lg:hidden">
          <PdpAddToCart
            accent={accent}
            companyCode={companyCode}
            image={media.find((m) => m.type === "image")?.url ?? null}
            inStock={inStock}
            name={product.name}
            price={price}
            slug={product.slug}
            variantId={selected?.variantId}
            variantName={hasChoice ? selected?.name : undefined}
          />
          {price != null ? <DeliveryCheck companyCode={companyCode} currency={currency} subtotal={price} /> : null}
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-sf-line pt-3 text-xs text-sf-ink-soft">
            <a className="underline hover:text-sf-ink" href={`/s/${companyCode}/policies/shipping`}>
              Shipping info
            </a>
            <a className="underline hover:text-sf-ink" href={`/s/${companyCode}/policies/returns`}>
              Returns &amp; refunds
            </a>
          </div>
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="space-y-4 rounded-lg border border-sf-line bg-sf-surface p-4">
          {price != null ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="sf-price text-2xl font-semibold" style={{ color: accent }}>
                  {formatPrice(price, currency)}
                </p>
                {discountPercent != null && mrp != null ? (
                  <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">{discountPercent}% OFF</span>
                ) : null}
              </div>
              {discountPercent != null && mrp != null ? (
                <p className="text-sm text-sf-ink-soft">
                  M.R.P.: <span className="line-through">{formatPrice(mrp, currency)}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-medium"
            style={inStock ? { backgroundColor: "#dcfce7", color: "#15803d" } : { backgroundColor: "#fee2e2", color: "#b91c1c" }}
          >
            {inStock ? "In stock" : "Out of stock"}
          </span>

          <PdpAddToCart
            accent={accent}
            companyCode={companyCode}
            image={media.find((m) => m.type === "image")?.url ?? null}
            inStock={inStock}
            name={product.name}
            price={price}
            slug={product.slug}
            variantId={selected?.variantId}
            variantName={hasChoice ? selected?.name : undefined}
          />

          {price != null ? <DeliveryCheck companyCode={companyCode} currency={currency} subtotal={price} /> : null}

          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-sf-line pt-3 text-xs text-sf-ink-soft">
            <a className="underline hover:text-sf-ink" href={`/s/${companyCode}/policies/shipping`}>
              Shipping info
            </a>
            <a className="underline hover:text-sf-ink" href={`/s/${companyCode}/policies/returns`}>
              Returns &amp; refunds
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
