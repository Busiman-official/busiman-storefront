import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartBadge } from "@/components/CartBadge";
import { EditableImageUrl, EditableText } from "@/components/admin/EditableText";
import { CatalogFilterBar, LogoBadge, StoreFooter, WhatsAppFloatButton, ProductBadgeRibbon, ProductPriceLine, type TemplateProps } from "./shared";

/** Modern — a hero-led layout for a single-brand or boutique store, where the store's own identity
 * (logo, name, story) is the first thing a shopper sees, not an immediate product wall. The first
 * product gets a large "featured" treatment; the rest follow in a roomier grid. */
export function ModernTemplate({ companyCode, site, catalog, categories, activeCategory, activeSort }: TemplateProps) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";
  const [featured, ...rest] = catalog.items;

  const nextPageParams = new URLSearchParams({ page: String(catalog.page + 1) });
  if (activeCategory) nextPageParams.set("category", activeCategory);
  if (activeSort !== "name") nextPageParams.set("sort", activeSort);

  return (
    <>
      <div className="relative overflow-hidden" id="section-navbar" style={{ backgroundColor: accent }}>
        <div className="absolute right-4 top-4">
          <CartBadge companyCode={companyCode} currency={siteDetails.currency} />
        </div>
        <div className="mx-auto max-w-5xl px-6 py-14 text-center text-white sm:py-20">
          <div className="mx-auto mb-5 flex justify-center">
            <EditableImageUrl companyCode={companyCode} value={siteDetails.logoUrl}>
              <LogoBadge accent="rgba(255,255,255,0.2)" logoUrl={siteDetails.logoUrl} size={64} storeName={siteDetails.storeName} />
            </EditableImageUrl>
          </div>
          <EditableText as="h1" className="text-2xl font-semibold sm:text-4xl" companyCode={companyCode} field="storeName" value={siteDetails.storeName} />
          <EditableText
            as="p"
            className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base"
            companyCode={companyCode}
            field="aboutText"
            multiline
            placeholder="Tell shoppers your story"
            value={siteDetails.aboutText ?? ""}
          />
        </div>
      </div>

      <main className="mx-auto flex-1 w-full max-w-5xl px-4 py-10 space-y-8" id="section-products">
        <CatalogFilterBar
          activeCategory={activeCategory}
          activeSort={activeSort}
          basePath={`/s/${companyCode}`}
          categories={categories}
        />

        {catalog.items.length === 0 ? (
          <div className="rounded-lg border border-sf-line bg-sf-surface p-8 text-center text-sm text-sf-ink-soft">
            No products are listed here yet. Check back soon.
          </div>
        ) : (
          <>
            {featured ? (
              <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-sf-line bg-sf-surface">
                  {featured.image ? (
                    <Image alt={featured.name} className="object-cover" fill sizes="(max-width: 640px) 100vw, 50vw" src={featured.image} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-sf-ink-soft">No image</div>
                  )}
                  {featured.badge ? <ProductBadgeRibbon badge={featured.badge} /> : null}
                  {!featured.inStock ? (
                    <span className="absolute left-3 top-3 rounded-full bg-sf-bg/90 px-2 py-0.5 text-[11px] font-medium text-sf-ink-soft">
                      Out of stock
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-sf-ink-soft">Featured</p>
                  <h2 className="text-2xl font-semibold text-sf-ink">{featured.name}</h2>
                  {featured.description ? <p className="text-sm text-sf-ink-soft">{featured.description}</p> : null}
                  <ProductPriceLine accent={accent} currency={siteDetails.currency} item={featured} size="base" />
                  {featured.price != null ? (
                    <div className="max-w-[220px]">
                      <AddToCartButton accent={accent} product={featured} />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {rest.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {rest.map((item) => (
                  <div className="space-y-2" key={item.slug}>
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-sf-line bg-sf-surface">
                      {item.image ? (
                        <Image alt={item.name} className="object-cover" fill sizes="(max-width: 640px) 50vw, 33vw" src={item.image} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-sf-ink-soft">No image</div>
                      )}
                      {item.badge ? <ProductBadgeRibbon badge={item.badge} /> : null}
                      {!item.inStock ? (
                        <span className="absolute left-2 top-2 rounded-full bg-sf-bg/90 px-2 py-0.5 text-[11px] font-medium text-sf-ink-soft">
                          Out of stock
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium text-sf-ink">{item.name}</p>
                    <ProductPriceLine accent={accent} currency={siteDetails.currency} item={item} />
                    {item.price != null ? <AddToCartButton accent={accent} product={item} /> : null}
                  </div>
                ))}
              </div>
            ) : null}

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
          </>
        )}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
      <WhatsAppFloatButton storeName={siteDetails.storeName} whatsappNumber={siteDetails.whatsappNumber} />
    </>
  );
}
