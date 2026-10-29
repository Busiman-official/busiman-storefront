/**
 * "Products you might like" — a horizontally-scrolling rail below the main product content.
 * Server Component (no interactivity needed beyond plain links); card markup mirrors
 * ClassicTemplate.tsx's grid card (image, category pill, badge ribbon, out-of-stock pill, price
 * line) so it reads as the same product-card language the rest of the storefront already uses,
 * rather than inventing a second card style for this one section.
 */
import Image from "next/image";
import Link from "next/link";
import { ProductBadgeRibbon, ProductPriceLine } from "@/components/templates/shared";
import type { StorefrontProduct } from "@/lib/api";

export function RelatedProducts({
  companyCode,
  products,
  accent,
  currency,
}: {
  companyCode: string;
  products: StorefrontProduct[];
  accent: string;
  currency: string;
}) {
  if (!products.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12 max-w-full">
      <h2 className="font-heading text-sm font-semibold text-sf-ink" id="related-heading">
        Products you might like
      </h2>
      <div className="-mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {products.map((item) => (
          <Link
            className="group w-36 flex-none cursor-pointer space-y-2 rounded-2xl border border-sf-line bg-sf-surface p-2 shadow-sm transition-shadow hover:shadow-md sm:w-44"
            href={`/s/${companyCode}/products/${item.slug}`}
            key={item.slug}
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-sf-bg">
              {item.image ? (
                <Image
                  alt={item.name}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  sizes="176px"
                  src={item.image}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-sf-ink-soft">No image</div>
              )}
              {item.badge ? <ProductBadgeRibbon badge={item.badge} /> : null}
              {!item.inStock ? (
                <span className="absolute right-2 top-2 rounded-full bg-sf-surface/90 px-2 py-0.5 text-[11px] font-medium text-sf-ink-soft">
                  Out of stock
                </span>
              ) : null}
            </div>
            <div className="min-h-10 space-y-0.5 px-1">
              <p className="line-clamp-2 text-sm text-sf-ink">{item.name}</p>
              <ProductPriceLine accent={accent} currency={currency} item={item} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
