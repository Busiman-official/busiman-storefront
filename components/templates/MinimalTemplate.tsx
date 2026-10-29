import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartBadge } from "@/components/CartBadge";
import { EditableText } from "@/components/admin/EditableText";
import { CatalogFilterBar, StoreFooter, ProductPriceLine, type TemplateProps } from "./shared";

const BADGE_LABELS: Record<string, string> = { new: "New", bestseller: "Bestseller", sale: "Sale" };

/** Minimal — a dense, text-forward row list with small thumbnails. No hero, no large photography;
 * built for a catalog-heavy store (hardware, wholesale, grocery) where a shopper is scanning many
 * items by name and price rather than browsing imagery. */
export function MinimalTemplate({ companyCode, site, catalog, categories, activeCategory, activeSort }: TemplateProps) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";

  const nextPageParams = new URLSearchParams({ page: String(catalog.page + 1) });
  if (activeCategory) nextPageParams.set("category", activeCategory);
  if (activeSort !== "name") nextPageParams.set("sort", activeSort);

  return (
    <>
      <header className="border-b border-sf-line" id="section-navbar">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <EditableText as="h1" className="flex-1 text-base font-semibold text-sf-ink" companyCode={companyCode} field="storeName" value={siteDetails.storeName} />
          <CartBadge companyCode={companyCode} currency={siteDetails.currency} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 space-y-4" id="section-products">
        <EditableText
          as="p"
          className="text-xs text-sf-ink-soft"
          companyCode={companyCode}
          field="aboutText"
          multiline
          placeholder="Tell shoppers what you sell"
          value={siteDetails.aboutText ?? ""}
        />

        <CatalogFilterBar
          activeCategory={activeCategory}
          activeSort={activeSort}
          basePath={`/s/${companyCode}`}
          categories={categories}
        />

        {catalog.items.length === 0 ? (
          <div className="rounded-md border border-sf-line p-6 text-center text-sm text-sf-ink-soft">
            No products are listed here yet. Check back soon.
          </div>
        ) : (
          <ul className="divide-y divide-sf-line border-y border-sf-line">
            {catalog.items.map((item) => (
              <li className="flex items-center gap-3 py-3" key={item.slug}>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-sf-bg">
                  {item.image ? <Image alt={item.name} className="object-cover" fill sizes="48px" src={item.image} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm text-sf-ink">
                    {item.name}
                    {item.badge ? (
                      <span className="shrink-0 rounded bg-sf-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sf-ink-soft">
                        {BADGE_LABELS[item.badge]}
                      </span>
                    ) : null}
                  </p>
                  <ProductPriceLine accent={accent} currency={siteDetails.currency} item={item} />
                  {!item.inStock ? <p className="text-[11px] text-sf-ink-soft">Out of stock</p> : null}
                </div>
                {item.price != null ? (
                  <div className="w-24 shrink-0">
                    <AddToCartButton accent={accent} companyCode={companyCode} product={item} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {catalog.hasMore ? (
          <div className="pt-2 text-center">
            <Link
              className="inline-block rounded-full border border-sf-line px-5 py-2 text-sm font-medium text-sf-ink"
              href={`/s/${companyCode}?${nextPageParams.toString()}`}
            >
              Load more
            </Link>
          </div>
        ) : null}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
