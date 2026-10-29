import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CategoryRail } from "@/components/CategoryRail";
import { EditableText } from "@/components/admin/EditableText";
import { HeroCarousel } from "./HeroCarousel";
import { NavbarFromSite, StoreFooter, WhatsAppFloatButton, formatPrice, ProductBadgeRibbon, ProductPriceLine, type TemplateProps } from "./shared";

function TruckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
      <path d="M3 16V6a1 1 0 0 1 1-1h9v11H4a1 1 0 0 1-1-1Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9h4l3 3.5V16h-7V9Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
      <path d="M12 3 4.5 6v5.5c0 4.5 3.1 7.7 7.5 9.5 4.4-1.8 7.5-5 7.5-9.5V6L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20l1.1-5.3A8.5 8.5 0 1 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
      <path
        d="M4 5c0-1 .8-1.8 1.8-1.8h2a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3 1L7.8 9.5a13 13 0 0 0 6.7 6.7l1.5-1.4a1 1 0 0 1 1-.3l3 .7a1 1 0 0 1 .8 1v2c0 1-.8 1.8-1.8 1.8C10.8 20 4 13.2 4 5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Classic — a hero-led storefront with a real trust strip (built only from data the tenant has
 * actually set, never invented claims) above a straightforward square-tile product grid. The safe,
 * familiar default for most general retail: clothing, electronics, gifts — anything where the
 * product photo itself sells the item. */
export function ClassicTemplate({ companyCode, site, catalog, categories, activeCategory, activeSort }: TemplateProps) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";

  const nextPageParams = new URLSearchParams({ page: String(catalog.page + 1) });
  if (activeCategory) nextPageParams.set("category", activeCategory);
  if (activeSort !== "name") nextPageParams.set("sort", activeSort);

  const deliveryTrust = siteDetails.shippingFlatRate
    ? siteDetails.freeShippingThreshold
      ? `Free delivery over ${formatPrice(siteDetails.freeShippingThreshold, siteDetails.currency)}`
      : `Delivery at ${formatPrice(siteDetails.shippingFlatRate, siteDetails.currency)}`
    : "Free delivery on every order";

  const trustItems: Array<{ icon: React.ReactNode; label: string }> = [
    { icon: <TruckIcon />, label: deliveryTrust },
    { icon: <ShieldIcon />, label: "Secure checkout on every order" },
  ];
  if (siteDetails.whatsappNumber) {
    trustItems.push({ icon: <ChatIcon />, label: "Chat with us on WhatsApp" });
  } else if (siteDetails.contactPhone) {
    trustItems.push({ icon: <PhoneIcon />, label: `Call us at ${siteDetails.contactPhone}` });
  }

  // Undefined means "on" — these fields only exist once a merchant has actually toggled them off
  // in the admin editor (see EcommerceSite.model.ts's own comment on the two flags).
  const showTrustStrip = siteDetails.trustStripEnabled !== false;
  const showCategoryRail = siteDetails.categoryRailEnabled !== false;
  const heroBg = siteDetails.heroBackgroundImage;
  // >= 1, not >= 2: a merchant building a carousel starts with exactly one slide, and that slide's
  // own text toggles (SlideDetailPanel) need to take effect immediately, not only once a second
  // slide exists. Arrows/dots still correctly stay hidden for a single slide — that's HeroCarousel's
  // own `count > 1` guard, a separate concern from whether Carousel owns the text rendering at all.
  // Requiring >= 2 here was a real bug: with exactly one slide, this used to fall through to
  // Classic's OWN hardcoded text block below, which has no show/hide toggles — so turning a slide's
  // heading/description/button off in the sidebar visibly did nothing.
  const heroSlides = siteDetails.heroSlides ?? [];
  const isCarouselHero = siteDetails.heroStyle === "carousel" && heroSlides.length >= 1;

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <section
        className={`relative overflow-hidden border-b border-sf-line px-4 py-14 text-center sm:py-20 ${isCarouselHero ? "min-h-80 sm:min-h-105" : ""}`}
        id="section-hero"
        style={heroBg || isCarouselHero ? undefined : { background: `color-mix(in srgb, ${accent} 7%, var(--sf-surface))` }}
      >
        {isCarouselHero ? (
          <HeroCarousel
            accent={accent}
            autoplayMs={siteDetails.heroAutoplayMs ?? 5000}
            defaultCtaText={siteDetails.heroCtaText}
            defaultCtaUrl={siteDetails.heroCtaUrl}
            defaultDescription={siteDetails.aboutText}
            defaultHeading={siteDetails.storeName}
            slides={heroSlides}
          />
        ) : heroBg ? (
          <>
            {/* A plain <img>, not next/image's `fill` — this section's own height is driven by its
                text content (py-14/py-20 padding), not by the image, so there's no fixed box for
                `fill` to size against; object-cover on an absolutely positioned element already
                does exactly what's needed here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={heroBg}
              style={{ objectPosition: `${siteDetails.heroImagePositionX ?? 50}% ${siteDetails.heroImagePositionY ?? 50}%` }}
            />
            {/* A fixed, deliberately strong scrim — not tuned per-photo — so the heading/description
                stay readable regardless of what the merchant uploads (a bright beach photo and a
                dark product shot both still pass contrast under the same 45% black). */}
            <div className="absolute inset-0 bg-black/45" />
          </>
        ) : null}
        {/* Carousel renders its own per-slide heading/description/button inside HeroCarousel above
            (it changes as slides rotate, so it can't be this one static block) — rendering this one
            too would duplicate it. */}
        {!isCarouselHero ? (
          <div className={`relative z-10 mx-auto max-w-2xl space-y-5 ${heroBg ? "text-white" : ""}`}>
            <EditableText
              as="h1"
              className={`font-heading text-3xl font-bold tracking-tight sm:text-4xl ${heroBg ? "text-white" : "text-sf-ink"}`}
              companyCode={companyCode}
              field="storeName"
              value={siteDetails.storeName}
            />
            <EditableText
              as="p"
              className={`text-sm sm:text-base ${heroBg ? "text-white/90" : "text-sf-ink-soft"}`}
              companyCode={companyCode}
              field="aboutText"
              multiline
              placeholder="Tell shoppers what makes your store worth buying from"
              value={siteDetails.aboutText ?? ""}
            />
            <a
              className="inline-block cursor-pointer rounded-full px-6 py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
              href={siteDetails.heroCtaUrl || "#catalog"}
              style={{ backgroundColor: accent }}
            >
              {siteDetails.heroCtaText || "Shop now"}
            </a>
          </div>
        ) : null}
      </section>

      {showTrustStrip ? (
        <div className="border-b border-sf-line bg-sf-surface px-3 py-5 sm:px-4" id="section-trust-strip">
          <div className={`mx-auto grid max-w-5xl gap-2 sm:gap-4 ${trustItems.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {trustItems.map((item) => (
              <div className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-3 sm:text-left" key={item.label}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
                  style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
                >
                  {item.icon}
                </span>
                <span className="text-xs font-medium leading-tight text-sf-ink sm:text-sm sm:leading-normal">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex-1 w-full max-w-5xl px-4 py-10 space-y-6" id="catalog">
        {showCategoryRail && categories.length > 0 ? (
          <div className="space-y-3" id="section-category-rail">
            <h2 className="font-heading text-sm font-semibold text-sf-ink">Shop by category</h2>
            <CategoryRail categories={categories} companyCode={companyCode} />
          </div>
        ) : null}

        {catalog.items.length === 0 ? (
          <div className="rounded-lg border border-sf-line bg-sf-surface p-8 text-center text-sm text-sf-ink-soft" id="section-products">
            No products are listed here yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" id="section-products">
            {catalog.items.map((item) => (
              <div
                className="group cursor-pointer space-y-2 rounded-2xl border border-sf-line bg-sf-surface p-2 shadow-sm transition-shadow hover:shadow-md"
                key={item.slug}
              >
                <Link className="block" href={`/s/${companyCode}/products/${item.slug}`}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-sf-bg">
                    {item.image ? (
                      <Image
                        alt={item.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        src={item.image}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-sf-ink-soft">No image</div>
                    )}
                    {item.category ? (
                      <span className="absolute left-2 top-2 rounded-full bg-sf-surface/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sf-ink-soft">
                        {item.category}
                      </span>
                    ) : null}
                    {item.badge ? <ProductBadgeRibbon badge={item.badge} /> : null}
                    {!item.inStock ? (
                      <span className="absolute right-2 top-2 rounded-full bg-sf-surface/90 px-2 py-0.5 text-[11px] font-medium text-sf-ink-soft">
                        Out of stock
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 min-h-10 space-y-0.5 px-1">
                    <p className="line-clamp-2 text-sm font-medium text-sf-ink">{item.name}</p>
                    {item.price != null ? (
                      <ProductPriceLine accent={accent} currency={siteDetails.currency} item={item} size="base" />
                    ) : (
                      <p className="text-xs text-sf-ink-soft">Price on request</p>
                    )}
                  </div>
                </Link>
                <div className="px-1 pb-1">
                  {item.price != null ? (
                    <AddToCartButton accent={accent} companyCode={companyCode} product={item} />
                  ) : (
                    <Link
                      className="block cursor-pointer rounded-full border border-sf-line py-2 text-center text-xs font-semibold text-sf-ink transition-colors hover:border-sf-ink-soft"
                      href={`/s/${companyCode}/products/${item.slug}`}
                    >
                      View details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {catalog.hasMore ? (
          <div className="pt-2 text-center">
            <Link
              className="inline-block cursor-pointer rounded-full border border-sf-line px-5 py-2 text-sm font-medium text-sf-ink transition-colors hover:border-sf-ink-soft"
              href={`/s/${companyCode}?${nextPageParams.toString()}`}
            >
              Load more
            </Link>
          </div>
        ) : null}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
      <WhatsAppFloatButton storeName={siteDetails.storeName} whatsappNumber={siteDetails.whatsappNumber} />
    </>
  );
}
