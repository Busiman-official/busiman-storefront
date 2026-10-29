/**
 * The product page's actual content (breadcrumb, gallery, name/price/description, add-to-cart,
 * footer, JSON-LD) — extracted out of page.tsx so the admin mirror route
 * (admin/products/[slug]/page.tsx) can render the identical markup without duplicating it. Stays a
 * plain Server Component; the admin route is the one that wraps this in AdminShell/EditModeProvider,
 * same split used for the home page's templates.
 */
import Link from "next/link";
import { NavbarFromSite, StoreFooter, WhatsAppFloatButton } from "@/components/templates/shared";
import type { StorefrontProductDetail, StorefrontSite } from "@/lib/api";
import { ProductVariantSection } from "./ProductVariantSection";
import { RelatedProducts } from "./RelatedProducts";

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

  // Mirrors the visible breadcrumb nav below exactly — search engines use this to render a
  // breadcrumb trail directly in results instead of a bare URL.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteDetails.storeName, item: homeHref },
      { "@type": "ListItem", position: 2, name: product.name },
    ],
  };

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8" id="section-page-content">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-sf-ink-soft">
          <Link className="hover:text-sf-ink" href={homeHref}>
            {siteDetails.storeName}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-sf-ink">{product.name}</span>
        </nav>

        <ProductVariantSection accent={accent} companyCode={companyCode} currency={siteDetails.currency} product={product} />

        <RelatedProducts accent={accent} companyCode={companyCode} currency={siteDetails.currency} products={product.related} />
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
      <WhatsAppFloatButton storeName={siteDetails.storeName} whatsappNumber={siteDetails.whatsappNumber} />

      {/* Structured data for search engines (Google Shopping/rich results) — not visible to shoppers. */}
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} type="application/ld+json" />
    </>
  );
}
