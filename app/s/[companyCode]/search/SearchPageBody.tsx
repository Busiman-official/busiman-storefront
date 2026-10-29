import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { SearchFilterSidebar } from "@/components/SearchFilterSidebar";
import { NavbarFromSite, StoreFooter, ProductBadgeRibbon, ProductPriceLine, formatPrice } from "@/components/templates/shared";
import type { CatalogSort, StorefrontSearchResult, StorefrontSite } from "@/lib/api";

export function SearchPageBody({
  companyCode,
  site,
  results,
  categories,
  q,
  page,
  category,
  sort,
  inStockOnly,
  minPrice,
  maxPrice,
  /** `/s/{companyCode}/search` on the public page, `/s/{companyCode}/admin/search` inside the
   * editor — every Link/sidebar filter on this page is built from this one value, so the admin
   * mirror route only has to pass a different basePath to stay inside the editor. */
  basePath,
  homeHref,
}: {
  companyCode: string;
  site: StorefrontSite;
  results: StorefrontSearchResult;
  categories: string[];
  q: string;
  page: number;
  category?: string;
  sort?: CatalogSort;
  inStockOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
  basePath: string;
  homeHref: string;
}) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";
  const hasActiveFilters = Boolean(category || sort || inStockOnly || minPrice != null || maxPrice != null);

  function hrefWithout(omit: "category" | "sort" | "inStockOnly" | "price"): string {
    const p = new URLSearchParams({ q });
    if (category && omit !== "category") p.set("category", category);
    if (sort && omit !== "sort") p.set("sort", sort);
    if (inStockOnly && omit !== "inStockOnly") p.set("inStockOnly", "true");
    if (omit !== "price") {
      if (minPrice != null) p.set("minPrice", String(minPrice));
      if (maxPrice != null) p.set("maxPrice", String(maxPrice));
    }
    return `${basePath}?${p.toString()}`;
  }

  function hrefWithPage(nextPage: number): string {
    const p = new URLSearchParams({ q, page: String(nextPage) });
    if (category) p.set("category", category);
    if (sort) p.set("sort", sort);
    if (inStockOnly) p.set("inStockOnly", "true");
    if (minPrice != null) p.set("minPrice", String(minPrice));
    if (maxPrice != null) p.set("maxPrice", String(maxPrice));
    return `${basePath}?${p.toString()}`;
  }

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8" id="section-page-content">
        <h1 className="font-heading text-lg font-semibold text-sf-ink">
          {q.trim() ? `Results for "${q}"` : category ? category : "All products"}
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
          <SearchFilterSidebar
            activeCategory={category}
            activeSort={sort}
            basePath={basePath}
            categories={categories}
            inStockOnly={inStockOnly}
            maxPrice={maxPrice}
            minPrice={minPrice}
            priceBounds={results.priceBounds}
            query={q}
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-sf-ink-soft">
                {results.items.length === 0 && !results.hasMore ? "No results" : `${results.items.length}${results.hasMore ? "+" : ""} result${results.items.length === 1 ? "" : "s"}`}
              </p>
            </div>

            {hasActiveFilters ? (
              <div className="flex flex-wrap items-center gap-2">
                {category ? (
                  <Link className="flex cursor-pointer items-center gap-1 rounded-full border border-sf-line px-3 py-1 text-xs text-sf-ink" href={hrefWithout("category")}>
                    {category} ✕
                  </Link>
                ) : null}
                {sort ? (
                  <Link className="flex cursor-pointer items-center gap-1 rounded-full border border-sf-line px-3 py-1 text-xs text-sf-ink" href={hrefWithout("sort")}>
                    Sorted ✕
                  </Link>
                ) : null}
                {inStockOnly ? (
                  <Link className="flex cursor-pointer items-center gap-1 rounded-full border border-sf-line px-3 py-1 text-xs text-sf-ink" href={hrefWithout("inStockOnly")}>
                    In stock only ✕
                  </Link>
                ) : null}
                {minPrice != null || maxPrice != null ? (
                  <Link className="flex cursor-pointer items-center gap-1 rounded-full border border-sf-line px-3 py-1 text-xs text-sf-ink" href={hrefWithout("price")}>
                    {minPrice != null ? formatPrice(minPrice, siteDetails.currency) : "0"}–{maxPrice != null ? formatPrice(maxPrice, siteDetails.currency) : "any"} ✕
                  </Link>
                ) : null}
              </div>
            ) : null}

            {results.items.length === 0 ? (
              <div className="rounded-lg border border-sf-line bg-sf-surface p-8 text-center text-sm text-sf-ink-soft">
                {q.trim() && hasActiveFilters ? (
                  <>
                    No products matched &quot;{q}&quot; with these filters. Try{" "}
                    <Link className="underline" href={`${basePath}?q=${encodeURIComponent(q)}`}>
                      clearing your filters
                    </Link>
                    , or a different word.
                  </>
                ) : q.trim() ? (
                  <>
                    No products matched &quot;{q}&quot;. Try a different word, or{" "}
                    <Link className="underline" href={homeHref}>
                      browse the full store
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    No products found with these filters. Try{" "}
                    <Link className="underline" href={homeHref}>
                      browsing the full store
                    </Link>
                    .
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {results.items.map((item) => (
                  <div className="space-y-2" key={item.slug}>
                    <Link className="block" href={`${homeHref}/products/${item.slug}`}>
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-sf-line bg-sf-surface">
                        {item.image ? (
                          <Image alt={item.name} className="object-cover" fill sizes="(max-width: 640px) 50vw, 33vw" src={item.image} />
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
                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm font-medium text-sf-ink">{item.name}</p>
                        <ProductPriceLine accent={accent} currency={siteDetails.currency} item={item} />
                      </div>
                    </Link>
                    {item.price != null ? <AddToCartButton accent={accent} companyCode={companyCode} product={item} /> : null}
                  </div>
                ))}
              </div>
            )}

            {results.hasMore ? (
              <div className="pt-2 text-center">
                <Link
                  className="inline-block cursor-pointer rounded-full border border-sf-line px-5 py-2 text-sm font-medium text-sf-ink transition-colors hover:border-sf-ink-soft"
                  href={hrefWithPage(page + 1)}
                >
                  Load more
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
