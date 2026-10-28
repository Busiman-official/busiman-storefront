/**
 * The product page's actual content (breadcrumb, gallery, name/price/description, add-to-cart,
 * footer, JSON-LD) — extracted out of page.tsx so the admin mirror route
 * (admin/products/[slug]/page.tsx) can render the identical markup without duplicating it. Stays a
 * plain Server Component; the admin route is the one that wraps this in AdminShell/EditModeProvider,
 * same split used for the home page's templates.
 */
import Link from "next/link";
import { NavbarFromSite, StoreFooter, WhatsAppFloatButton, formatPrice } from "@/components/templates/shared";
import { PdpAddToCart } from "@/components/PdpAddToCart";
import type { StorefrontProductDetail, StorefrontSite } from "@/lib/api";
import { ProductGallery } from "./ProductGallery";

export function ProductPageBody({
  companyCode,
  site,
  product,
  homeHref,
}: {
  companyCode: string;
  site: StorefrontSite;
  product: StorefrontProductDetail;
  /** `/s/{companyCode}` on the public page, `/s/{companyCode}/admin` inside the editor — the one
   * link on this page AdminNavGuard can't rewrite ahead of time since it's the breadcrumb's own
   * href, not a click it's intercepting after the fact (both are fine either way, this just avoids
   * a visible redirect hop). */
  homeHref: string;
}) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";
  const productImages = product.media.filter((m) => m.type === "image").map((m) => m.url);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: productImages,
    offers:
      product.price != null
        ? { "@type": "Offer", price: product.price, priceCurrency: siteDetails.currency, availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
        : undefined,
  };

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8" id="section-page-content">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-sf-ink-soft">
          <Link className="hover:text-sf-ink" href={homeHref}>
            {siteDetails.storeName}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-sf-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 sm:grid-cols-2">
          <ProductGallery alt={product.name} media={product.media} />

          <div className="space-y-4">
            <h1 className="font-heading text-xl font-semibold text-sf-ink sm:text-2xl">{product.name}</h1>

            {product.badge ? (
              <span
                className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                  product.badge === "new" ? "bg-blue-600 text-white" : product.badge === "bestseller" ? "bg-amber-400 text-amber-950" : "bg-red-600 text-white"
                }`}
              >
                {product.badge === "new" ? "New" : product.badge === "bestseller" ? "Bestseller" : "Sale"}
              </span>
            ) : null}

            {product.price != null ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="sf-price text-xl font-semibold" style={{ color: accent }}>
                  {formatPrice(product.price, siteDetails.currency)}
                </p>
                {product.discountPercent != null && product.mrp != null ? (
                  <>
                    <p className="text-sm text-sf-ink-soft line-through">{formatPrice(product.mrp, siteDetails.currency)}</p>
                    <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">{product.discountPercent}% OFF</span>
                  </>
                ) : null}
              </div>
            ) : null}

            <span
              className="inline-block rounded-full px-2.5 py-1 text-xs font-medium"
              style={
                product.inStock
                  ? { backgroundColor: "#dcfce7", color: "#15803d" }
                  : { backgroundColor: "#fee2e2", color: "#b91c1c" }
              }
            >
              {product.inStock ? "In stock" : "Out of stock"}
            </span>

            {product.description ? <p className="whitespace-pre-line text-sm text-sf-ink-soft">{product.description}</p> : null}

            <PdpAddToCart
              accent={accent}
              image={productImages[0] ?? null}
              inStock={product.inStock}
              name={product.name}
              price={product.price}
              slug={product.slug}
            />
          </div>
        </div>
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
      <WhatsAppFloatButton storeName={siteDetails.storeName} whatsappNumber={siteDetails.whatsappNumber} />

      {/* Structured data for search engines (Google Shopping/rich results) — not visible to shoppers. */}
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} type="application/ld+json" />
    </>
  );
}
